<!-- Copyright (c) 2021-2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrField
    v-model="uiSchema.value"
    class="pb-1 mb-4"
    :description="uiSchema.description"
    :disabled="uiSchema.disabled"
    :is-html="uiSchema.isHtml"
    :label="uiSchema.label"
    :options="arrayOptions"
    :type="arrayType"
    :allow-empty="uiSchema.allowEmpty"
    :validation="uiSchema.validation"
    @input="updateValue" />
</template>
<script>
import FrField from '@forgerock/platform-shared/src/components/Field';

export default {
  name: 'ArrayDisplay',
  components: {
    FrField,
  },
  props: {
    /**
     * Schema for field
     */
    uiSchema: {
      type: Object,
      default: () => ({}),
    },
    /**
     * Path to property in model
     */
    path: {
      type: String,
      default: '',
    },
  },
  computed: {
    arrayType() {
      if (this.uiSchema.type === 'array') {
        return 'tag';
      }
      if (this.uiSchema.type === 'select') {
        return 'select';
      }
      return 'multiselect';
    },
    arrayOptions() {
      const { options } = this.uiSchema;
      if (!options) {
        return [];
      }
      return options;
    },
  },
  methods: {
    updateValue(value) {
      this.$emit('update:model', {
        path: this.path,
        value,
      });
    },
  },
};
</script>
