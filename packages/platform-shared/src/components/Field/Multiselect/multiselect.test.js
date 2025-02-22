/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import i18n from '@/i18n';
import MultiSelect from './index';

describe('Multiselect', () => {
  const defaultProps = {
    name: '',
  };

  function setup(props) {
    return mount(MultiSelect, {
      i18n,
      propsData: {
        ...defaultProps,
        ...props,
      },
    });
  }

  it('MultiSelect input adds tags', () => {
    const wrapper = setup({ taggable: true });

    expect(wrapper.vm.tagOptions).toStrictEqual([]);
    expect(wrapper.vm.inputValue).toStrictEqual([]);
    wrapper.vm.searchValue = 'test';

    wrapper.vm.addTag();
    expect(wrapper.vm.tagOptions).toStrictEqual([
      {
        multiselectId: 0,
        text: 'test',
        value: 'test',
      },
    ]);
    expect(wrapper.vm.inputValue).toStrictEqual([
      {
        multiselectId: 1,
        text: 'test',
        value: 'test',
      },
    ]);

    expect(wrapper.emitted().input).toEqual([[['test']]]);
  });

  it('MultiSelect input component process options prop from array', () => {
    const wrapper = setup({
      options: ['a', 'b', 'c'],
    });

    const expected = [
      {
        multiselectId: 0, text: 'a', value: 'a',
      },
      {
        multiselectId: 1, text: 'b', value: 'b',
      },
      {
        multiselectId: 2, text: 'c', value: 'c',
      },
    ];

    expect(wrapper.vm.selectOptions).toEqual(expected);
  });

  it('MultiSelect input component passes through options object prop and adds id', () => {
    const options = [
      { text: 'd', value: 'd' },
      { text: 'e', value: 'e' },
      { text: 'f', value: 'f' },
    ];

    const expected = [
      {
        multiselectId: 0, text: 'd', value: 'd',
      },
      {
        multiselectId: 1, text: 'e', value: 'e',
      },
      {
        multiselectId: 2, text: 'f', value: 'f',
      },
    ];

    const wrapper = setup({ options });

    expect(wrapper.vm.selectOptions).toEqual(expected);
  });

  it('MultiSelect input component renders the options', () => {
    const wrapper = setup({
      options: ['a', 'b', 'c'],
    });

    const multiselect = wrapper.find('.multiselect');
    const elements = multiselect.findAll('.multiselect__element');

    expect(multiselect.exists()).toBe(true);
    expect(elements.length).toBe(3);
  });

  it('MultiSelect input component allows multiple selections', async () => {
    const wrapper = setup({
      options: ['a', 'b', 'c'],
    });

    const multiselect = wrapper.find('.multiselect');
    const elements = () => multiselect.findAll('.multiselect__option');

    multiselect.trigger('click');
    elements().at(1).trigger('click');
    expect(wrapper.vm.inputValue).toEqual([{
      multiselectId: 1,
      text: 'b',
      value: 'b',
    }]);
    expect(wrapper.emitted().input).toEqual([[['b']]]);

    multiselect.trigger('click');
    elements().at(0).trigger('click');
    expect(wrapper.vm.inputValue).toEqual([{
      multiselectId: 1,
      text: 'b',
      value: 'b',
    }, {
      multiselectId: 0,
      text: 'a',
      value: 'a',
    }]);
    expect(wrapper.emitted().input).toEqual([[['b']], [['b', 'a']]]);
  });

  it('MultiSelect passes through component slots', () => {
    const wrapper = mount(MultiSelect, {
      i18n,
      propsData: {
        ...defaultProps,
      },
      slots: {
        prepend: '<span class="test_prepend">prepend</span>',
        append: '<span class="test_append">append</span>', // Will match <slot name="FooBar" />,
      },
    });

    expect(wrapper.contains('.test_prepend')).toBe(true);
    expect(wrapper.contains('.test_append')).toBe(true);
  });

  it('Multiselect is not autofocused on absence of prop "autofocus"', async () => {
    const wrapper = mount(MultiSelect, {
      i18n,
      attachToDocument: true,
      propsData: {
        ...defaultProps,
        autofocus: false,
      },
      slots: {
        prepend: '<span class="test_prepend">prepend</span>',
        append: '<span class="test_append">append</span>', // Will match <slot name="FooBar" />,
      },
    });

    try {
      await wrapper.vm.$nextTick();
      expect(document.activeElement).toEqual(document.body);
    } finally {
      wrapper.destroy();
    }
  });

  it('Multiselect is autofocused on prop "autofocus"', async () => {
    const wrapper = mount(MultiSelect, {
      i18n,
      attachToDocument: true,
      propsData: {
        ...defaultProps,
        autofocus: true,
      },
      slots: {
        prepend: '<span class="test_prepend">prepend</span>',
        append: '<span class="test_append">append</span>', // Will match <slot name="FooBar" />,
      },
    });

    try {
      await wrapper.vm.$nextTick();
      expect(document.activeElement).toEqual(wrapper.element.querySelector('input'));
    } finally {
      wrapper.destroy();
    }
  });

  it('MultiSelect input sets inputValue properly', () => {
    const selectOption = {
      value: 'selectOption',
      multiselectId: 0,
      text: 'selectOption',
    };
    const existingValue = { value: 'existingValue' };
    const wrapper = setup({
      options: [selectOption],
    });
    wrapper.vm.inputValue = [existingValue];
    wrapper.vm.setInputValue(['selectOption']);
    expect(wrapper.vm.inputValue).toEqual([selectOption]);
    wrapper.vm.inputValue = [existingValue];
    wrapper.vm.setInputValue(['existingValue', 'selectOption']);
    expect(wrapper.vm.inputValue.length).toEqual(2);
    expect(wrapper.vm.inputValue).toEqual([existingValue, selectOption]);
  });
});
