/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint-disable indent */

import { shallowMount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import EntitlementDetailsTab from './index';

describe('EntitlementDetailsTab', () => {
  function mountComponent(entitlement) {
    return shallowMount(EntitlementDetailsTab, {
      mocks: {
        $t: (t) => t,
      },
      propsData: {
        entitlement,
      },
    });
  }

  describe('component loaded', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = mountComponent({
        description: 'Zoran Admin',
        id: '34858681-bdd9-4482-bae3-9805b77e6db6',
        linkQualifier: 'default',
        mailEnabled: false,
        proxyAddresses: [],
        securityEnabled: true,
        __NAME__: 'Zoran Admin',
        _id: '34858681-bdd9-4482-bae3-9805b77e6db6',
      });
    });

    it('component should load correctly', () => {
      expect(wrapper.name()).toBe('EntitlementDetailsTab');
    });

    it('entitlement data loaded correctly on template', () => {
      const owner = findByTestId(wrapper, 'owner');
      expect(owner.find('dd').text()).toBe(blankValueIndicator);

      const description = findByTestId(wrapper, 'entDescription');
      expect(description.find('dd').text()).toBe(wrapper.vm.entitlement.description);

      const country = findByTestId(wrapper, 'country');
      expect(country.find('dd').text()).toBe(blankValueIndicator);
    });
  });

  describe('should load correctly entitlement data in template', () => {
    it.each`
    name                      | entitlementProp | value
    ${'given false'}          | ${false}        | ${'false'}
    ${'given zero'}           | ${0}            | ${'0'}
    ${'given empty string'}   | ${''}           | ${''}
    ${'given null'}           | ${null}         | ${blankValueIndicator}
    ${'given undefined'}      | ${undefined}    | ${blankValueIndicator}
    ${'given NaN'}            | ${NaN}          | ${'NaN'}
    ${'given valid string'}   | ${'test'}       | ${'test'}
    ${'given valid number'}   | ${10}           | ${'10'}
    ${'given an empty array'} | ${[]}           | ${'[]'}
    `('$name', ({ entitlementProp, value }) => {
      const wrapper = mountComponent({ entitlementProp });
      const elem = findByTestId(wrapper, 'entitlementProp');
      expect(elem.exists()).toBe(true);
      expect(elem.find('dt').text()).toBe('entitlementProp');
      expect(elem.find('dd').text()).toBe(value);
    });
  });
});
