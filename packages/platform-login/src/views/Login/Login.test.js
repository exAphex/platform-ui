/**
 * Copyright (c) 2021-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import i18n from '@/i18n';
import Login from './index';

describe('Login.vue', () => {
  let wrapper;
  const $route = {
    params: {
      tree: undefined,
    },
  };

  beforeEach(() => {
    wrapper = shallowMount(Login, {
      i18n,
      stubs: {
        'router-link': true,
      },
      mocks: {
        $route,
        $t: () => {},
        $store: {
          state: {
            SharedStore: {
              webStorageAvailable: true,
            },
          },
        },
      },
      methods: {
        nextStep() {},
      },
    });
  });

  it('Load login component', () => {
    expect(wrapper.vm.$options.name).toEqual('Login');
  });

  it('Removes undefined and "undefined" tree from stepParams', () => {
    const expectedStepParams = {
      query: {
        suspendedId: 'test',
      },
      realmPath: 'test',
    };
    // test undefined tree
    wrapper.setData({
      realm: 'test',
      suspendedId: 'test',
    });
    expect(wrapper.vm.getStepParams()).toEqual(expectedStepParams);
    // test tree with the string "undefined"
    wrapper.setData({
      realm: 'test',
      suspendedId: 'test',
      treeId: 'undefined',
    });

    expect(wrapper.vm.getStepParams()).toEqual(expectedStepParams);
  });

  it('Detects /am/console as the default path', () => {
    expect(wrapper.vm.isDefaultPath('/am/console')).toEqual(true);
    expect(wrapper.vm.isDefaultPath('/am/fail')).toEqual(false);
  });

  it('Detects /auth/console as the default path', () => {
    expect(wrapper.vm.isDefaultPath('/auth/console')).toEqual(true);
    expect(wrapper.vm.isDefaultPath('/auth/fail')).toEqual(false);
  });

  it('Detects SAML urls', () => {
    const samlUrls = [
      'https://default.iam.example.com/am/Consumer/metaAlias/avsp',
      'https://default.iam.example.com/am/saml2/continue/metaAlias/avidp',
      'https://default.iam.example.com/am/saml2/jsp/idpSSOInit.jsp?metaAlias=/avidp',
    ];
    samlUrls.forEach((url) => {
      expect(wrapper.vm.isSamlURL(url)).toEqual(true);
    });
    expect(wrapper.vm.isSamlURL('https://default.iam.example.com/am/XUI')).toEqual(false);
  });

  it('Redirects SAML goto urls', () => {
    const successURL = '/am/console';
    const realm = '/root';
    const gotoBase = '?goto=';
    const samlUrls = [
      'https://default.iam.example.com/am/Consumer/metaAlias/avsp',
      'https://default.iam.example.com/am/saml2/continue/metaAlias/avidp',
      'https://default.iam.example.com/am/saml2/jsp/idpSSOInit.jsp?metaAlias=/avidp',
    ];

    // Mock gotoURL validation call
    jest.spyOn(wrapper.vm, 'getRequestService').mockImplementation(() => ({ post: () => Promise.resolve({ data: { successURL } }) }));

    // Test verifyGotoUrlAndRedirect
    samlUrls.forEach(async (goto) => {
      // Set up window object with correct goto search params
      Object.defineProperty(global, 'window', {
        value: {
          location: {
            search: `${gotoBase}${goto}`,
          },
        },
        writable: true,
      });

      expect(await wrapper.vm.verifyGotoUrlAndRedirect(successURL, realm)).toEqual(goto);
    });
  });

  it('Sets page title if url hash includes "service" or authIndexType && authIndexValue params', () => {
    const windowHash = '#/service/ResetPassword';
    const windowHashWithParams = '#/service/Login?goto=https%3A%2F%2Fdefault.iam.example.com';
    const windowSearch = '&authIndexType=service&authIndexValue=Registration';
    const URLSearchParams = {
      get: (param) => {
        if (param === 'authIndexType') return 'service';
        if (param === 'authIndexValue') return 'Registration';
        return null;
      },
    };

    wrapper.vm.setPageTitle(windowSearch, URLSearchParams);
    expect(document.title).toEqual('Registration');

    wrapper.vm.setPageTitle(windowHash);
    expect(document.title).toEqual('ResetPassword');

    wrapper.vm.setPageTitle(windowHashWithParams);
    expect(document.title).toEqual('Login');
  });

  it('keeps params like noSession when is a link from an Email URL', () => {
    const getCurrentQueryString = () => 'noSession=true&param1=test';

    const expectedStepParams = {
      query: {
        suspendedId: 'test',
        noSession: 'true',
        param1: 'test',
      },
      realmPath: 'test',
    };
    // test undefined tree
    wrapper.setData({
      realm: 'test',
      suspendedId: 'test',
    });
    wrapper.setMethods({ getCurrentQueryString });
    expect(wrapper.vm.getStepParams()).toEqual(expectedStepParams);
  });

  it('keeps params like noSession when is a redirect from a callback ', () => {
    const getCurrentQueryString = () => 'noSession=true&param1=test';

    const expectedStepParams = {
      query: {
        noSession: 'true',
        param1: 'test',
        code: 'test',
        state: 'test',
        scope: 'test',
      },
      realmPath: 'test',
    };
    // test undefined tree
    wrapper.setData({
      realm: 'test',
    });
    wrapper.vm.code = 'test';
    wrapper.vm.state = 'test';
    wrapper.vm.scope = 'test';
    wrapper.setMethods({ getCurrentQueryString });
    expect(wrapper.vm.getStepParams()).toEqual(expectedStepParams);
  });
});
