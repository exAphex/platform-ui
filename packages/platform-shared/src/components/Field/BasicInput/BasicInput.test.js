/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint-disable indent */

import { mount } from '@vue/test-utils';
import * as clipboard from 'clipboard-polyfill/text';
import BasicInput from './index';
import i18n from '@/i18n';
import { findByTestId } from '../../../utils/testHelpers';

describe('BasicInput', () => {
  const defaultProps = {
    name: '',
    autofocus: false,
    type: 'test',
    testid: 'stub-testid',
  };

  function setup(props) {
    return mount(BasicInput, {
      i18n,
      attachToDocument: true,
      propsData: {
        ...defaultProps,
        ...props,
      },
    });
  }

  describe('@renders', () => {
    describe('as number', () => {
      it('default', () => {
        const wrapper = setup({ type: 'number' });
        const input = findByTestId(wrapper, 'input-stub-testid');

        // has correct default classes
        expect(input.classes()).toContain('form-control');
        expect(input.classes()).not.toContain('polyfill-placeholder');
        expect(input.classes()).not.toContain('is-invalid');
        expect(input.classes()).not.toContain('text-truncate');

        expect(input.attributes('disabled')).toBeFalsy();
        expect(input.attributes('readonly')).toBeFalsy();
        expect(input.attributes('type')).toBe('text');
        expect(input.attributes('inputmode')).toBe('numeric');
        expect(input.attributes('pattern')).toBe('[0-9]*');

        const showPasswordButton = findByTestId(wrapper, 'btn-show-password-stub-testid');
        expect(showPasswordButton.exists()).toBeFalsy();

        const copyValueButton = findByTestId(wrapper, 'btn-copy-stub-testid');
        expect(copyValueButton.exists()).toBeFalsy();
      });

      describe('when placeholder', () => {
        it('when no floatLabel', async () => {
          const wrapper = setup({ type: 'number', floatingLabel: false, placeholder: 'stub-placeholder' });
          await wrapper.vm.$nextTick();

          const input = findByTestId(wrapper, 'input-stub-testid');
          expect(input.attributes('placeholder')).toBe('stub-placeholder');
        });

        it('when floatLabel', async () => {
          const wrapper = setup({ type: 'number', placeholder: 'stub-placeholder', label: 'stub-label' });
          await wrapper.vm.$nextTick();

          const input = findByTestId(wrapper, 'input-stub-testid');
          expect(input.attributes('placeholder')).toBe('stub-label');
        });
      });

      it('copy value button', () => {
        const wrapper = setup({
          type: 'number',
          copy: true,
        });
        const copyValueButton = findByTestId(wrapper, 'btn-copy-stub-testid');
        expect(copyValueButton.exists()).toBeTruthy();

        const input = findByTestId(wrapper, 'input-stub-testid');
        expect(input.classes()).toContain('text-truncate');
      });

      it('when disabled', () => {
        const wrapper = setup({ type: 'number', disabled: true });

        const input = findByTestId(wrapper, 'input-stub-testid');
        expect(input.attributes('disabled')).toBeTruthy();
      });
    });

    describe('as text', () => {
      it('default', () => {
        jest.useFakeTimers();
        const wrapper = setup({ autofocus: true });

        // Note: there is a manual delay when setting focus - to maintain consistency between browsers
        jest.advanceTimersByTime(600);
        const input = findByTestId(wrapper, 'input-stub-testid');
        expect(input.attributes('id')).toBe(document.activeElement.id);

        // has correct default classes
        expect(input.classes()).toContain('form-control');
        expect(input.classes()).not.toContain('polyfill-placeholder');
        expect(input.classes()).not.toContain('is-invalid');
        expect(input.classes()).not.toContain('text-truncate');

        expect(input.attributes('disabled')).toBeFalsy();
        expect(input.attributes('readonly')).toBeFalsy();
        expect(input.attributes('type')).toBe('text');

        const showPasswordButton = findByTestId(wrapper, 'btn-show-password-stub-testid');
        expect(showPasswordButton.exists()).toBeFalsy();

        const copyValueButton = findByTestId(wrapper, 'btn-copy-stub-testid');
        expect(copyValueButton.exists()).toBeFalsy();
        jest.useRealTimers();
      });

      describe('when placeholder', () => {
        it('when no floatLabel', async () => {
          const wrapper = setup({ floatingLabel: false, placeholder: 'stub-placeholder' });
          await wrapper.vm.$nextTick();

          const input = findByTestId(wrapper, 'input-stub-testid');
          expect(input.attributes('placeholder')).toBe('stub-placeholder');
        });

        it('when floatLabel', async () => {
          const wrapper = setup({ placeholder: 'stub-placeholder', label: 'stub-label' });
          await wrapper.vm.$nextTick();

          const input = findByTestId(wrapper, 'input-stub-testid');
          expect(input.attributes('placeholder')).toBe('stub-label');
        });
      });

      it('copy value button', () => {
        const wrapper = setup({ copy: true });
        const copyValueButton = findByTestId(wrapper, 'btn-copy-stub-testid');
        expect(copyValueButton.exists()).toBeTruthy();
      });

      it('when disabled', () => {
        const wrapper = setup({ disabled: true });

        const input = findByTestId(wrapper, 'input-stub-testid');
        expect(input.attributes('disabled')).toBeTruthy();
      });
    });

    describe('as password', () => {
      it('with show password button', () => {
        const wrapper = setup({ type: 'password' });
        const showPasswordButton = findByTestId(wrapper, 'btn-show-password-stub-testid');
        expect(showPasswordButton.exists()).toBeTruthy();
      });

      it('when disabled', () => {
        const wrapper = setup({ type: 'password', disabled: true });

        const input = findByTestId(wrapper, 'input-stub-testid');
        expect(input.attributes('disabled')).toBeTruthy();
      });
    });

    it('prepend & append slots', () => {
      const wrapper = mount(BasicInput, {
        i18n,
        propsData: {
          ...defaultProps,
        },
        slots: {
          prepend: '<span class="test_prepend">prepend</span>',
          append: '<span class="test_append">append</span>',
        },
      });

      expect(wrapper.contains('.test_prepend')).toBe(true);
      expect(wrapper.contains('.test_append')).toBe(true);
    });
  });

  describe('@actions', () => {
    it('should reveal password', async () => {
      const wrapper = setup({ type: 'password' });
      const input = findByTestId(wrapper, 'input-stub-testid');
      const showPasswordButton = findByTestId(wrapper, 'btn-show-password-stub-testid');

      expect(showPasswordButton.attributes('name')).toBe('revealButton');
      expect(input.attributes('type')).toBe('password');
      expect(showPasswordButton.attributes('aria-label')).toBe('Show password');

      await showPasswordButton.trigger('click');

      expect(input.attributes('type')).toBe('text');
      expect(showPasswordButton.attributes('aria-label')).toBe('Hide password');
    });

    it('should not reveal password when input is disabled', async () => {
      const wrapper = setup({
        disabled: true,
        type: 'password',
      });
      const input = findByTestId(wrapper, 'input-stub-testid');
      const showPasswordButton = findByTestId(wrapper, 'btn-show-password-stub-testid');

      expect(input.attributes('type')).toBe('password');
      await showPasswordButton.trigger('click');
      expect(input.attributes('type')).toBe('password');
    });

    it('should copy value to clipboard', async () => {
      jest.spyOn(clipboard, 'writeText').mockImplementation(() => Promise.resolve());

      const wrapper = setup({ copy: true });
      const basicInputClipboardCopySpy = jest.spyOn(wrapper.vm, 'copyValueToClipboard');
      const displayNotificationSpy = jest.spyOn(wrapper.vm, 'displayNotification');
      expect(basicInputClipboardCopySpy).not.toHaveBeenCalled();
      expect(displayNotificationSpy).not.toHaveBeenCalled();

      const copyButton = findByTestId(wrapper, 'btn-copy-stub-testid');
      await copyButton.trigger('click');

      expect(basicInputClipboardCopySpy).toHaveBeenCalledTimes(1);
      expect(displayNotificationSpy).toHaveBeenCalledWith('success', 'Copied to your clipboard');
    });

    it('should display error when clipboard.writeText fails', async () => {
      const writeTextError = Error('Something went wrong.');
      jest.spyOn(clipboard, 'writeText').mockImplementation(() => Promise.reject(writeTextError));

      const wrapper = setup({ copy: true });
      const showErrorMessageSpy = jest.spyOn(wrapper.vm, 'showErrorMessage');
      expect(showErrorMessageSpy).not.toHaveBeenCalled();

      const copyButton = findByTestId(wrapper, 'btn-copy-stub-testid');
      await copyButton.trigger('click');

      expect(showErrorMessageSpy).toHaveBeenCalledWith(writeTextError, 'Failed to copy');
    });

    describe('when number field', () => {
      it.each`
      name                                              | value     | expectedValue
      ${'should allow input given numeric value'}       | ${'583'}  | ${'583'}
      ${'should prevent input given non-numeric value'} | ${'text'} | ${'0'}
      `('$name', async ({ value, expectedValue }) => {
        const wrapper = setup({ type: 'number' });

        const input = findByTestId(wrapper, 'input-stub-testid');
        await input.setValue(value);

        expect(input.element.value).toBe(expectedValue);
      });
    });
  });

  describe('@unit tests', () => {
    it('starts animation', async () => {
      const wrapper = setup({ label: 'test' });

      wrapper.vm.$refs = {
        input: {
          matches: {
            call: () => true,
          },
        },
      };
      const input = findByTestId(wrapper, 'input-stub-testid');

      expect(input.classes()).not.toContain('polyfill-placeholder');
      expect(wrapper.vm.floatLabels).toBe(false);
      wrapper.vm.animationStart();
      expect(wrapper.vm.floatLabels).toBe(true);
      await wrapper.vm.$nextTick();

      expect(input.classes()).toContain('polyfill-placeholder');
    });

    it('given floatingLabel false, should not start animation', async () => {
      const wrapper = mount(BasicInput, {
        i18n,
        propsData: {
          ...defaultProps,
          floatingLabel: false,
          testid: 'stub-testid',
        },
      });
      const animationStartSpy = jest.spyOn(wrapper.vm, 'animationStart');

      expect(wrapper.vm.floatLabels).toBe(false);
      findByTestId(wrapper, 'input-stub-testid').trigger('animationstart');
      expect(animationStartSpy).not.toHaveBeenCalled();
      expect(wrapper.vm.floatLabels).toBe(false);
    });
  });
});
