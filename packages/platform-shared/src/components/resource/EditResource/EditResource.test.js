/**
 * Copyright (c) 2019-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import * as SessionsApi from '@/api/SessionsApi';
import * as SchemaApi from '@/api/SchemaApi';
import * as ManagedResourceApi from '@/api/ManagedResourceApi';
import EditResource from './index';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('EditResource.vue', () => {
  const $route = {
    path: '/test',
    meta: {
      listRoute: 'test',
    },
    params: {
      resourceName: 'alpha_user',
      resourceType: 'resourceType',
      resourceId: 'resourceId',
    },
  };

  let wrapper;
  beforeEach(() => {
    jest.spyOn(EditResource, 'mounted')
      .mockImplementation(() => { });

    wrapper = shallowMount(EditResource, {
      localVue,
      stubs: {
        'router-link': true,
      },
      mocks: {
        $route,
        $t: () => { },
        $store: {
          state: {
            isFraas: false,
            userId: 'foo',
            UserStore: {
              adminUser: true,
            },
            SharedStore: {
              hasAmUrl: true,
              workforceEnabled: true,
            },
          },
        },
        $router: {
          push: jest.fn(),
        },
      },
      propsData: {
        canClearSessions: true,
      },
    });
    jest.spyOn(wrapper.vm, 'getRequestService').mockImplementation(() => (
      {
        get: () => Promise.resolve({
          data: {
            DELETE: {
              allowed: true,
              properties: [
                'test',
              ],
            },
            VIEW: {
              allowed: true,
              properties: [
                'test',
              ],
            },
            UPDATE: {
              allowed: true,
              properties: [
              ],
            },
          },
        }),
        delete: () => Promise.resolve({}),
      }
    ));
    jest.spyOn(SchemaApi, 'getSchema').mockImplementation(() => Promise.resolve({
      data: {
        result: [{
          resourceCollection: 'test',
          properties: {
            test: 'testProperties',
          },
          _id: 'testId',
        }],
        order: [
          'test',
          'test2',
        ],
        title: 'testTitle',
        properties: {
          test: {
            value: 'test',
            viewable: true,
            type: 'object',
            title: 'testTitle',
            propName: 'testPropName',
            order: [
              'innerTest',
            ],
            properties: {
              innerTest: {},
            },
            isTemporalConstraint: true,
          },
          test2: {
            value: 'test2',
            type: 'string',
            title: 'test2Title',
            propName: 'test2PropName',
            viewable: true,
            isTemporalConstraint: false,
            isConditional: true,
          },
        },
      },
    }));

    wrapper.setData({
      id: 'id',
      resourceName: 'resourceName',
      resourceType: 'resourceType',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('EditResource page loaded', () => {
    expect(wrapper.name()).toBe('EditResource');
  });

  it('Format display data', async () => {
    wrapper.vm.resourceSchema = {
      icon: 'fa-test',
      order: ['country', 'userName', 'sn', 'email', 'contractor', 'applications', 'manager'],
      required: ['userName'],
      properties: {
        userName: {
          type: 'string',
          title: 'Username',
          viewable: true,
        },
        sn: {
          type: 'string',
          title: 'Last Name',
          viewable: true,
        },
        email: {
          type: 'string',
          title: 'Email',
          viewable: true,
        },
        contractor: {
          type: 'boolean',
          title: 'Contractor',
          viewable: true,
        },
        country: {
          type: 'string',
          title: 'Country',
          viewable: true,
        },
        manager: {
          type: 'relationship',
          title: 'Manager',
          viewable: true,
        },
        applications: {
          type: 'array',
          title: 'Applications',
          viewable: true,
          items: {
            type: 'relationship',
          },
        },
      },
    };

    wrapper.vm.resourcePrivilege = {
      UPDATE: {
        allowed: true,
        properties: ['userName', 'contractor', 'sn', 'email', 'applications', 'manager'],
      },
      DELETE: {
        allowed: true,
      },
      VIEW: {
        allowed: true,
        properties: ['userName', 'country', 'sn', 'email'],
      },
    };

    wrapper.vm.resourceDetails = {
      userName: 'test',
      email: 'test@test.com',
    };

    wrapper.vm.generateDisplay();

    expect(wrapper.vm.icon).toBe('check_box_outline_blank');
    expect(wrapper.vm.formFields.contractor).toBe(false);
    // make sure the view and update properties are merged together and in the correct order
    expect(wrapper.vm.displayProperties.length).toBe(7);
    expect(wrapper.vm.displayProperties[0].key).toBe('country');
    // set relationshipProperties
    wrapper.vm.relationshipProperties = wrapper.vm.getRelationshipProperties(wrapper.vm.resourceSchema, wrapper.vm.resourcePrivilege);
    expect(wrapper.vm.relationshipProperties).toEqual({
      applications: {
        disabled: false,
        items: {
          type: 'relationship',
        },
        key: 'applications',
        propName: 'applications',
        readOnly: false,
        title: 'Applications',
        type: 'array',
        value: '',
        viewable: true,
      },
      manager: {
        type: 'relationship',
        title: 'Manager',
        key: 'manager',
        propName: 'manager',
        readOnly: false,
        disabled: false,
        value: '',
        viewable: true,
      },
    });
    // filters out 'application' relationship if workforce enabled
    // so it can display the custom applications component.
    expect(wrapper.vm.viewableRelationshipArrayProperties).toEqual({
      applications: {
        type: 'array',
        items: {
          type: 'relationship',
        },
        title: 'Applications',
        key: 'applications',
        propName: 'applications',
        readOnly: false,
        disabled: false,
        value: '',
        viewable: true,
      },
    });
    expect(wrapper.vm.buildResourceUrl()).toEqual('resourceType/resourceName/id?_fields=*,manager/*');
  });

  describe('clearing sessions', () => {
    it('calls the API clearSessions method and displays a notification when clearing sessions is successful', async () => {
      const displayNotificationSpy = jest.spyOn(wrapper.vm, 'displayNotification');
      const clearSpy = jest.spyOn(SessionsApi, 'clearSessions').mockImplementation(() => Promise.resolve());
      const refreshDataSpy = jest.spyOn(wrapper.vm, 'refreshData').mockImplementation(() => { });
      jest.spyOn(SchemaApi, 'getSchema').mockImplementation(() => Promise.resolve());

      await wrapper.vm.clearSessionsAndCloseModal();

      expect(clearSpy).toHaveBeenCalled();
      expect(displayNotificationSpy).toHaveBeenCalled();
      expect(refreshDataSpy).toHaveBeenCalled();
    });

    it('calls the API clearSessions method and displays an error notification when clearing sessions is not successful', async () => {
      const showErrorSpy = jest.spyOn(wrapper.vm, 'showErrorMessage');
      const clearSpy = jest.spyOn(SessionsApi, 'clearSessions').mockImplementation(() => Promise.reject());
      const refreshDataSpy = jest.spyOn(wrapper.vm, 'refreshData').mockImplementation(() => { });
      jest.spyOn(SchemaApi, 'getSchema').mockImplementation(() => Promise.resolve());

      await wrapper.vm.clearSessionsAndCloseModal();

      expect(clearSpy).toHaveBeenCalled();
      expect(showErrorSpy).toHaveBeenCalled();
      expect(refreshDataSpy).toHaveBeenCalled();
    });
  });

  it('loads data when can clear sessions', async () => {
    jest.spyOn(SessionsApi, 'getSessionInfo').mockImplementation(() => Promise.resolve({
      data: {
        resultCount: 1,
      },
    }));
    wrapper.setProps({
      canClearSessions: true,
    });
    wrapper.vm.loadData = jest.fn();
    wrapper.vm.isOpenidmAdmin = false;
    await wrapper.vm.refreshData();
    expect(wrapper.vm.resourcePrivilege).toBe(null);
    expect(wrapper.vm.clearSessionsName).toBe('');
    expect(wrapper.vm.loadData).toHaveBeenCalled();
  });

  it('loads data when can not clear sessions', async () => {
    jest.spyOn(SessionsApi, 'getSessionInfo').mockImplementation(() => Promise.resolve({
      data: {
        resultCount: 1,
      },
    }));
    wrapper.setProps({
      canClearSessions: false,
    });
    wrapper.vm.loadData = jest.fn();

    expect(wrapper.vm.clearSessionsName).toBe('');

    await wrapper.vm.loadData();
    expect(wrapper.vm.resourcePrivilege).toBe(null);
    expect(wrapper.vm.loadData).toHaveBeenCalled();
  });

  it('gets object type property display properties', () => {
    wrapper.vm.isOpenidmAdmin = false;
    expect(wrapper.vm.getObjectTypeProperyDisplayProperties({
      order: [
        'test1',
      ],
      properties: {
        test1: {
          key: 'test1',
          value: 'test1Value',
          readOnly: true,
        },
        test2: {
          key: 'test2',
          value: 'test2Value',
          readOnly: false,
        },
      },
    })).toStrictEqual([{
      disabled: false,
      key: 'test1',
      readOnly: true,
      value: null,
    }]);
  });

  it('deletes resource', async () => {
    const notificationSpy = jest.spyOn(wrapper.vm, 'displayNotification');
    await wrapper.vm.deleteResource();
    expect(notificationSpy).toHaveBeenCalledWith('success', undefined);
  });

  it('populates the mobile dropdown menu property', () => {
    const payload = [
      { title: 'Tab 1 Name' },
      { title: 'Tab 2 Name' },
      { title: 'Tab 3 Name' },
    ];

    wrapper.vm.populateMobileDropdownTabs(payload);
    expect(wrapper.vm.mobileDropdownTabs).toEqual([
      'Tab 1 Name',
      'Tab 2 Name',
      'Tab 3 Name',
    ]);
  });

  describe('linked applications', () => {
    it('Only loads linked applications for openidm-admins', async () => {
      const linkedSpy = jest.spyOn(ManagedResourceApi, 'getLinkedApplications').mockImplementation(() => Promise.resolve());

      wrapper.vm.isOpenidmAdmin = false;
      await wrapper.vm.loadLinkedApplicationsData();
      expect(linkedSpy).not.toHaveBeenCalled();

      wrapper.vm.isOpenidmAdmin = true;
      await wrapper.vm.loadLinkedApplicationsData();
      expect(linkedSpy).toHaveBeenCalled();
    });

    it('Extracts the linked application name in a human readable format', async () => {
      jest.spyOn(SchemaApi, 'getSchema').mockImplementation(() => Promise.resolve(
        {
          data: {
            properties: {},
            connectorRef: {
              displayName: '',
            },
          },
        },
      ));
      const apps = [
        { resourceName: 'system/ConnectorName/__ACCOUNT__/user', content: {} },
      ];
      await wrapper.vm.formatLinkedApplications(apps);
      const appName = wrapper.vm.linkedApplications[0].name;
      expect(appName).toEqual('ConnectorName');
    });

    it('Extracts the linked application type from connectorRef using displayName if it exists', async () => {
      jest.spyOn(SchemaApi, 'getSchema').mockImplementation(() => Promise.resolve(
        {
          data: {
            properties: {},
            connectorRef: {
              displayName: 'TestType',
            },
          },
        },
      ));
      const apps = [
        { resourceName: 'system/ConnectorName/__ACCOUNT__/user', content: {} },
      ];
      await wrapper.vm.formatLinkedApplications(apps);
      let appConnectorType = wrapper.vm.linkedApplications[0].connectorType;
      expect(appConnectorType).toEqual('TestType');

      jest.spyOn(SchemaApi, 'getSchema').mockImplementation(() => Promise.resolve(
        {
          data: {
            properties: {},
            connectorRef: {
              connectorName: 'Test2Type',
            },
          },
        },
      ));

      await wrapper.vm.formatLinkedApplications(apps);
      appConnectorType = wrapper.vm.linkedApplications[0].connectorType;
      expect(appConnectorType).toEqual('Test2Type');
    });

    it('Gets the image for a linked application if it exists, and sets a default if not', () => {
      const ldapImg = 'ldap.svg';
      const defaultImg = 'database.svg';
      const connectorType = 'org.identityconnectors.ldap.LdapConnector';
      let result = wrapper.vm.getLinkedAppImg(connectorType);
      expect(result).toEqual(ldapImg);

      result = wrapper.vm.getLinkedAppImg('test-for-default');
      expect(result).toBeTruthy();
      expect(result).toEqual(defaultImg);
    });

    it('Sets linked application property names, value and types', async () => {
      jest.spyOn(SchemaApi, 'getSchema').mockImplementation(() => Promise.resolve(
        {
          data: {
            properties: {
              username: {
                type: 'string',
                nativeName: 'username',
              },
              tel: {
                type: 'integer',
                nativeName: 'telephone',
              },
            },
            connectorRef: {
              displayName: '',
            },
          },
        },
      ));
      const apps = [
        {
          resourceName: 'system/ConnectorName/__ACCOUNT__/user',
          content: {
            username: 'testuser',
            tel: 123456,
          },
        },
      ];
      await wrapper.vm.formatLinkedApplications(apps);
      expect(wrapper.vm.linkedApplications[0].data[0].name).toEqual('username');
      expect(wrapper.vm.linkedApplications[0].data[0].type).toEqual('string');
      expect(wrapper.vm.linkedApplications[0].data[0].value).toEqual('testuser');
      expect(wrapper.vm.linkedApplications[0].data[1].name).toEqual('telephone');
      expect(wrapper.vm.linkedApplications[0].data[1].type).toEqual('integer');
      expect(wrapper.vm.linkedApplications[0].data[1].value).toEqual(123456);
    });

    it('Ignores any linked application properties that do not have an associated schema or neccessary schema properties', async () => {
      jest.spyOn(SchemaApi, 'getSchema').mockImplementation(() => Promise.resolve(
        {
          data: {
            properties: {
              testProp1: {
                type: 'string',
              },
              testProp2: {
                nativeName: 'testprop2',
              },
              testProp3: {
                nativeName: 'testprop3-ignored',
                type: 'string',
              },
            },
            connectorRef: {
              displayName: '',
            },
          },
        },
      ));
      const apps = [
        {
          resourceName: 'system/ConnectorName/__ACCOUNT__/user',
          content: {
            testProp1: 'Ignored',
            testProp2: 'Ignored',
            ignored: 'I should be ignored',
          },
        },
      ];
      await wrapper.vm.formatLinkedApplications(apps);
      expect(wrapper.vm.linkedApplications[0].data.length).toBeFalsy();
    });
  });
});
