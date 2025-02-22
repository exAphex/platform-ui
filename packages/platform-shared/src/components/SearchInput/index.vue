<!-- Copyright (c) 2020-2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    class="fr-icon-input-holder">
    <FrIcon
      class="fr-icon fr-icon-input-left"
      :name="prependIcon"
    />
    <a
      tabindex="0"
      v-if="value.length > 0"
      @click.prevent="clearSearch()"
      href="#">
      <FrIcon
        class="fr-icon fr-icon-input-right"
        :name="appendIcon"
      />
    </a>
    <!--
      Emitted when pressing enter key to search
      @event search
     -->
    <BInputGroup>
      <BFormInput
        ref="searchInput"
        :placeholder="placeholder"
        :aria-label="placeholder"
        @focus="$emit('search-input-focus')"
        @blur="$emit('search-input-blur')"
        @keydown.native.enter="$emit('search')"
        @keydown.native.esc="clearSearch"
        v-model="value"
        class="fr-icon-input mx-0"
        type="search" />
      <slot name="append" />
    </BInputGroup>
  </div>
</template>

<script>
import {
  BFormInput,
  BInputGroup,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';

/**
 * Component that provides a left and right icon for a text input.
 */
export default {
  name: 'SearchInput',
  components: {
    BFormInput,
    BInputGroup,
    FrIcon,
  },
  props: {
    /**
     * Material icon name to right of input that clears existing input.
     */
    appendIcon: {
      type: String,
      default: 'close',
    },
    /**
     * Placeholder text that is visibile when input value is empty string.
     */
    placeholder: {
      type: String,
      default: 'Search',
    },
    /**
     * Material icon name to left of input used to indicate what field is for.
     */
    prependIcon: {
      type: String,
      default: 'search',
    },
  },
  data() {
    return {
      value: '',
      searchHasFocus: false,
    };
  },
  methods: {
    /**
     * Clear the value from the input.
     */
    clearSearch() {
      this.value = '';
      this.$refs.searchInput.$el.focus();
      /**
       * Emitted after clicking the append icon and input set to empty string.
       */
      this.$emit('clear');
    },
  },
  watch: {
    value(newVal) {
      /**
       * Emitted when input value changes.
       *
       * @property {String} newVal input value.
       */
      this.$emit('input', newVal);
    },
  },
};
</script>

<style lang="scss" scoped>
.fr-icon-input-holder {
  position: relative;

  .fr-icon-input {
    padding-left: 2.5rem;
    border: none;

    &::-webkit-search-cancel-button {
      display: none;
    }
  }

  .fr-icon {
    position: absolute;
    z-index: 1000;
    margin-top: 16px;

    &.fr-icon-input-left {
      margin-left: 20px;
    }

    &.fr-icon-input-right {
      right: 0;
      margin-right: 18px;
      cursor: pointer;
      color: $gray-500;

      &:hover {
        color: $gray-900;
      }
    }
  }

  .input-group {
    border: 1px solid $gray-400;
    border-radius: 5px;
  }

  .form-control:focus {
    border-color: transparent;
    box-shadow: none;
    outline: none;
  }

  .fr-icon-input:only-child:focus {
    box-shadow: 0 0 0 1pt $blue;
    outline: 0;
    border-radius: 5px;
  }
}

</style>
