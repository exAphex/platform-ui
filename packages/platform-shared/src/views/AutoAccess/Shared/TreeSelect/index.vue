<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <Treeselect
    v-model="localValue"
    :multiple="true"
    :options="options"
    :disable-branch-nodes="true"
    value-format="object"
    :placeholder="$t('access.dashboard.selectLabels')">
    <div
      slot="value-label"
      slot-scope="{ node }">
      {{ node.raw.fullLabel }}
    </div>
  </Treeselect>
</template>

<script>
/* eslint-disable import/no-extraneous-dependencies */
import Treeselect from '@riophae/vue-treeselect';
import '@riophae/vue-treeselect/dist/vue-treeselect.css';

export default {
  name: 'TreeSelect',
  components: {
    Treeselect,
  },
  props: {
    options: {
      type: Array,
      default: () => [],
    },
    value: {
      type: Array,
      default: () => [],
    },
  },
  watch: {
    localValue(newValues) {
      this.$emit('change', newValues);
    },
  },
  mounted() {
    this.localValue = this.value;
  },
  data() {
    return {
      localValue: [],
    };
  },
};
</script>

<style lang="scss" scoped>
::v-deep .vue-treeselect__multi-value-item {
  color: inherit;
  background: #e4f4fd;
}

::v-deep .vue-treeselect__value-remove {
  color: inherit;
}

::v-deep .vue-treeselect__value-container {
  padding: 5px;
}
</style>
