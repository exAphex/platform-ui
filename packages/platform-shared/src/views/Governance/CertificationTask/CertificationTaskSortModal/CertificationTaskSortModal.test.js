/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import CertificationTaskSortModal from './index';

let wrapper;

function mountComponent(options) {
  wrapper = shallowMount(CertificationTaskSortModal, {
    methods: {
      cancel: jest.fn(),
    },
    mocks: {
      $t: (t) => t,
      ...options,
    },
    propsData: {
      taskListColumns: [],
    },
  });
}
describe('CertificationTaskSortModal', () => {
  describe('Component mount', () => {
    it('CertificationTaskSortModal successfully loaded', () => {
      mountComponent();
      expect(wrapper.name()).toEqual('CertificationTaskSortModal');
    });

    it('should render default modalId', () => {
      expect(wrapper.find('#CertificationTaskSortConfirmAccountModal').exists()).toBeTruthy();
    });

    it('should render prop modalId', () => {
      wrapper = shallowMount(CertificationTaskSortModal, {
        mocks: {
          $t: (t) => t,
        },
        propsData: {
          modalId: 'CertificationTaskSortConfirmEntitlementModal',
        },
      });
      expect(wrapper.find('#CertificationTaskSortConfirmEntitlementModal').exists()).toBeTruthy();
    });
  });
});
