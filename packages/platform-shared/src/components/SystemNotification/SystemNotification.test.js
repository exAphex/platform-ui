/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, createWrapper } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import i18n from '@/i18n';
import FrSystemNotification from '@/components/SystemNotification';

describe('SystemNotification', () => {
  const defaultProps = {
    i18n,
    propsData: {
      data: {
        content: 'Scheduled Tenant Migration {{placeholder_management_migration_date}}',
        variant: 'warning',
        placeholderManagementMigrationDate: '2022-11-10T10:29:48Z',
      },
      active: true,
    },
  };

  const propsWithModal = {
    propsData: {
      data: {
        content: 'Scheduled Tenant Migration {{placeholder_management_migration_date}}',
        variant: 'warning',
        placeholderManagementMigrationDate: '2022-11-10T10:29:48Z',
        modal: {
          title: 'Scheduled Tenant Migration',
          content: 'About this migration',
        },
      },
      active: true,
    },
  };

  function setup(props) {
    return mount(FrSystemNotification, {
      ...defaultProps,
      ...props,
    });
  }

  describe('@renders', () => {
    it('should render the SystemNotification', () => {
      const wrapper = setup();
      const systemNotification = wrapper.find(FrSystemNotification);
      expect(systemNotification.exists()).toBeTruthy();
    });

    it('should render alert with content and replace placeholder with date', () => {
      const wrapper = setup();
      const alert = findByTestId(wrapper, 'system-notification');
      const alertContent = alert.text();
      expect(alert.exists()).toBeTruthy();
      expect(alertContent).toContain('Scheduled Tenant Migration');
      // Expect the date placeholder to have been replaced. We cannot check test
      // for the date here as it gets formatted with the timezone and is therefore
      // different from machine to machine.
      expect(alertContent).not.toContain('{{placeholder_management_migration_date}}');
    });

    it('should render view details button if modal exists', () => {
      let wrapper = setup();
      let viewDetails = findByTestId(wrapper, 'notification-view-details');
      expect(viewDetails.exists()).toBeFalsy();

      wrapper = setup(propsWithModal);
      viewDetails = findByTestId(wrapper, 'notification-view-details');
      expect(viewDetails.exists()).toBeTruthy();
    });

    it('should render close button', () => {
      const wrapper = setup();
      const close = findByTestId(wrapper, 'notification-close');
      expect(close.exists()).toBeTruthy();
    });
  });

  describe('@actions', () => {
    it('should hide system notification when close is clicked', async () => {
      const wrapper = setup();
      const close = findByTestId(wrapper, 'notification-close');

      expect(wrapper.emitted()['hide-system-notification']).toBeFalsy();
      close.trigger('click');
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted()['hide-system-notification']).toBeTruthy();
    });

    it('should display modal when view details is clicked', async () => {
      const wrapper = setup(propsWithModal);
      const root = createWrapper(wrapper.vm.$root);
      const viewDetails = findByTestId(wrapper, 'notification-view-details');

      expect(root.emitted()['bv::show::modal']).toBeFalsy();
      viewDetails.trigger('click');
      await wrapper.vm.$nextTick();
      expect(root.emitted()['bv::show::modal']).toEqual([['SystemNotificationModal']]);

      const bodyWrap = createWrapper(document.body);
      const modalTitle = findByTestId(bodyWrap, 'system-notification-modal-title');
      const modalContent = findByTestId(bodyWrap, 'system-notification-modal-content');

      expect(modalTitle.text()).toBe('Scheduled Tenant Migration');
      expect(modalContent.text()).toBe('About this migration');
    });
  });
});
