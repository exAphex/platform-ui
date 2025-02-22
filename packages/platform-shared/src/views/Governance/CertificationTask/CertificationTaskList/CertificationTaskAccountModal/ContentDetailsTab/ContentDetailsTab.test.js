/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import ContentDetailsTab from './index';

describe('contentDetailsTab', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(ContentDetailsTab, {
      mocks: {
        $t: (t) => t,
      },
      propsData: {
        content: {
          id: 'test',
        },
      },
    });
  });

  it('component should load correclty', () => {
    expect(wrapper.name()).toBe('ContentDetailsTab');
  });
});
