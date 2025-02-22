/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import DateRangePicker from './index';

describe('Date Range Picker Component', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(DateRangePicker, {
      mocks: {
        $t: (text) => text,
      },
      propsData: {
        dateRange: {
          endDate: '2023-01-27T23:59:59-05:00',
          startDate: '2022-12-28T00:00:00-05:00',
        },
        value: {
          endDate: '2023-01-27T23:59:59-05:00',
          startDate: '2022-12-28T00:00:00-05:00',
        },
      },
    });
  });
  it('Component succesfully loaded', () => {
    expect(wrapper.name()).toEqual('DateRangePicker');
  });
  it('get/set in inputVal computed property works propertly', () => {
    expect(wrapper.vm.inputVal.startDate).toEqual('2022-12-28T00:00:00-05:00');
    expect(wrapper.vm.inputVal.endDate).toEqual('2023-01-27T23:59:59-05:00');
    wrapper.setData({
      value: {
        endDate: '2023-01-27T23:59:59-05:00',
        startDate: '2021-12-28T00:00:00-05:00',
      },
    });
    expect(wrapper.vm.inputVal.startDate).toBe('2021-12-28T00:00:00-05:00');
  });
});
