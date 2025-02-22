<!-- Copyright (c) 2020-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrInputLayout
    :description="description"
    :id="id"
    :errors="errors"
    :is-html="isHtml"
    :label="label"
    :name="name"
    :validation="validation"
    :validation-immediate="validationImmediate">
    <VueMultiSelect
      :id="id"
      v-bind="$attrs"
      v-if="selectOptions"
      v-model="inputValue"
      label="text"
      ref="vms"
      track-by="multiselectId"
      role="combobox"
      :data-testid="testid"
      :class="[{'polyfill-placeholder': floatLabels }, 'white-label-background form-control p-0', {'no-multiselect-label': !label }, {'h-100': floatLabels || !label }]"
      :close-on-select="closeOnSelect"
      :disabled="disabled"
      :hide-selected="true"
      :multiple="true"
      :name="name"
      :options="selectOptions"
      :placeholder="defaultPlaceholder"
      :searchable="defaultSearchable"
      :show-labels="false"
      :tag-placeholder="$t('common.placeholders.addOption')"
      :taggable="taggable"
      @close="close"
      @input="$emit('input', map(inputValue, 'value'))"
      @open="openHandler"
      @search-change="searchChange"
      @tag="addTag">
      <template #noResult>
        {{ $t('common.noResult') }}
      </template>
      <template #tag="{option, remove}">
        <span :class="['multiselect__tag', valueClass]">
          <span
            class="multiselect__tag-contents"
            tabindex="0"
            :data-testid="`multi-select-tag-contents-${testid}`">
            {{ option && option.text }}
          </span>
          <span
            class="multiselect__tag-icon"
            tabindex="0"
            :data-testid="`multi-select-tag-close-icon-${testid}`"
            @click.prevent="remove(option)"
            @keydown.enter="remove(option)"
            aria-hidden="true" />
        </span>
      </template>
      <template
        v-for="(key, slotName) in $scopedSlots"
        v-slot:[slotName]="slotData">
        <!-- @slot pass-through slot -->
        <slot
          :name="slotName"
          v-bind="slotData" />
      </template>
    </VueMultiSelect>
    <template
      v-for="(key, slotName) in $scopedSlots"
      v-slot:[slotName]="slotData">
      <!-- @slot pass-through slot -->
      <slot
        :name="slotName"
        v-bind="slotData" />
    </template>
  </FrInputLayout>
</template>

<script>
import {
  find,
  has,
  isEqual,
  map,
} from 'lodash';
import VueMultiSelect from 'vue-multiselect';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin/';
import FrInputLayout from '../Wrapper/InputLayout';
import InputMixin from '../Wrapper/InputMixin';

/**
 *  Multi select input. Allows selection of multiple elements in a dropdown
 *
 *  @Mixes InputMixin - default props and methods for inputs
 *  @param {Array} value default []
 */
export default {
  name: 'MultiSelect',
  mixins: [InputMixin, NotificationMixin],
  components: {
    FrInputLayout,
    VueMultiSelect,
  },
  props: {
    /**
     * Enable/disable closing after selecting an option
     */
    closeOnSelect: {
      type: Boolean,
      default: false,
    },
    /**
     * Placeholder text
     */
    placeholder: {
      type: String,
      default: '',
    },
    /**
     * Options for select input.
     */
    options: {
      type: [Array, Object],
      default: () => [],
    },
    /**
     * Allow searching
     */
    searchable: {
      type: Boolean,
      default: true,
    },
    /**
     * Allow tagging
     */
    taggable: {
      type: Boolean,
      default: false,
    },
    /**
     * CSS class for selected values
     */
    valueClass: {
      type: String,
      default: '',
    },
    testid: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      searchValue: '',
      nextIdTag: 0,
      tagOptions: [],
    };
  },
  mounted() {
    if (this.defaultSearchable) {
      this.$refs.vms.$refs.search.setAttribute('autocomplete', 'off');
    }

    if (this.autofocus) {
      this.openHandler();
    }
  },
  computed: {
    selectOptions() {
      let mapOptions = [];
      if (this.options.length) {
        if (has(this.options[0], 'value')) {
          mapOptions = map(this.options, (option) => ({
            text: option.text,
            value: option.value,
            multiselectId: option.multiselectId !== undefined ? option.multiselectId : this.generateTagId(),
            ...option,
          }));
        } else {
          mapOptions = map(this.options, (option) => ({
            text: option,
            value: option,
            multiselectId: this.generateTagId(),
          }));
        }
      }
      return [...mapOptions, ...this.tagOptions];
    },
    defaultSearchable() {
      return this.searchable || this.selectOptions.length > 9;
    },
    defaultPlaceholder() {
      return this.placeholder || this.$t('common.typeToSearch');
    },
  },
  methods: {
    /**
     * Handler for when a tag is being added to the value
     */
    addTag() {
      if (this.taggable && this.searchValue.length > 0) {
        this.searchValue.split(',').forEach((untrimmedVal) => {
          const newVal = untrimmedVal.trim();
          const existsInCurrentValues = find(this.inputValue, { value: newVal });
          if (!existsInCurrentValues) {
            this.tagOptions.push({
              multiselectId: this.generateTagId(), text: newVal, value: newVal,
            });
            this.inputValue.push({
              multiselectId: this.generateTagId(), text: newVal, value: newVal,
            });
            this.$emit('input', map(this.inputValue, 'value'));
          }
        });
      }
    },
    /**
     * Handler for when the multiselect dropdown is closed.
     */
    close() {
      this.addTag();
      this.inputValueHandler(this.inputValue);
    },
    inputValueHandler(inputValue) {
      this.floatLabels = (inputValue.length || document.activeElement === this.$refs.vms.$el.querySelector('input')) > 0 && this.label;
    },
    /**
     * Generate a unique id for a tag
     *
     * @returns tag id
     */
    generateTagId() {
      const { nextIdTag } = this;
      this.nextIdTag += 1;
      return nextIdTag;
    },
    map,
    /**
     * @description focus the Vue Multi Select component (vms) and floats the label
     */
    openHandler() {
      this.$refs.vms.$el.querySelector('input').focus();
      this.floatLabels = true;
    },
    /**
     * Handler for when the user types in the search input.
     * Track the value and bubble the event up.
     *
     * @param {String} value search text
     */
    searchChange(value) {
      this.searchValue = value;
      this.$emit('search-change', value);
    },
    /**
     * Handler for when input value is updated
     * Checks for the option in the select options and to see if new value is actually new
     *
     * @param {Object} newVal new input value
     * @returns {Object} input value
     */
    setInputValue(newVal) {
      let newInputValue = newVal;
      if (!has(newInputValue[0], 'value')) {
        newInputValue = map(newVal, (val) => {
          const existingValue = find(this.inputValue, { value: val });
          const selectOption = find(this.selectOptions, { value: val });
          if (selectOption) {
            return selectOption;
          }

          return existingValue;
        });
      }

      if (!isEqual(this.inputValue, newInputValue)) {
        this.inputValue = newInputValue;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@forgerock/platform-shared/src/components/Field/assets/vue-multiselect.scss';

.multiselect .multiselect__tag {
  .multiselect__tag-icon {
    &:focus-visible {
      outline: solid 2px $primary;
      outline-offset: -2px;
      -webkit-transition: none;
      transition: none;
    }
  }

  .multiselect__tag-contents {
    &:focus-visible {
      outline: solid 2px $primary;
      outline-offset: -1px;
      -webkit-transition: none;
      transition: none;
    }
  }
}

::v-deep .form-label-group {
  .form-label-group-input {
    .multiselect--active {
      outline-offset: 2px;
      outline: 2px solid;
    }
  }
}
</style>
