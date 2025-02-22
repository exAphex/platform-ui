<!-- Copyright (c) 2020-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="pt-2">
    <BCardBody>
      <div :class="{ 'border-bottom': isValidJSONString(listValues) && isValidField(items)}">
        <div class="d-flex justify-content-between align-items-center">
          <label>{{ capitalizedDescription }}</label>
        </div>
        <div>
          <div
            v-if="listValues && listValues.length === 0"
            class="d-flex pt-3 pb-3 px-0 border-top align-items-center">
            <div class="text-muted text-left flex-grow-1">
              ({{ $t('common.none') }})
            </div>
            <button
              class="btn btn-outline-secondary mr-1 mb-2 mb-lg-0"
              @click.prevent="addElementToList(-1)">
              <FrIcon
                name="add"
              />
            </button>
          </div>
          <div
            v-else-if="isValidJSONString(listValues) && isValidField(items)"
            v-for="(list, index) in listValues"
            :key="list.listUniqueIndex"
            class="d-flex pt-3 pb-2 px-0 border-top">
            <div class="flex-grow-1 pr-3 position-relative">
              <div class="form-row align-items-center">
                <div class="col-lg-12 pb-2">
                  <div>
                    <div class="position-relative">
                      <FrField
                        v-model="list.value"
                        type="tag"
                        :label="label"
                        @input="emitInput(listValues)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div class="list-button-container position-relative d-inline-flex justify-content-end">
                <button
                  type="button"
                  class="btn btn-outline-secondary mr-1 mb-2 mb-lg-0"
                  @click.prevent="removeElementFromList(index)">
                  <FrIcon
                    name="remove"
                  />
                </button>
                <button
                  type="button"
                  class="btn btn-outline-secondary mr-1 mb-2 mb-lg-0"
                  @click.prevent="addElementToList(index)">
                  <FrIcon
                    name="add"
                  />
                </button>
              </div>
            </div>
          </div>
          <div v-else>
            <FrInlineJsonEditor
              language="json"
              :value="advancedValue"
              :read-only="false"
              :line-count="lineCount"
              v-on="$listeners"
              @update-field="$emit('input', $event)" />
          </div>
        </div>
      </div>
    </BCardBody>
  </div>
</template>

<script>
import {
  forEach,
  cloneDeep,
} from 'lodash';
import {
  BCardBody,
} from 'bootstrap-vue';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrInlineJsonEditor from '@forgerock/platform-shared/src/components/InlineJsonEditor';
import ListsMixin from '@forgerock/platform-shared/src/mixins/ListsMixin';

/**
 * @description Component that provides support for list of lists
 *
 * Attempts to render list of lists. If the depth of the array exceeds two levels
 * or is the array is not valid JSON, displays array in code editor
 */
export default {
  name: 'ListOfLists',
  components: {
    BCardBody,
    FrField,
    FrIcon,
    FrInlineJsonEditor,
  },
  mixins: [
    ListsMixin,
  ],
  props: {
    description: {
      type: String,
      default: '',
    },
    items: {
      type: Object,
      default: () => {},
    },
    label: {
      type: String,
      default: '',
    },
    name: {
      type: String,
      default: '',
    },
    value: {
      type: [String, Array],
      default: '',
    },
  },
  data() {
    return {
      hover: false,
      expanded: false,
      listValues: [],
      // eslint-disable-next-line vue/no-reserved-keys
      listUniqueIndex: 0,
    };
  },
  computed: {
    advancedValue() {
      return this.listValues.map((val) => (val.value));
    },
  },
  mounted() {
    if (this.value && this.value !== '' && this.value !== null) {
      const listValues = cloneDeep(this.value).map((val) => ({
        value: val,
        listUniqueIndex: this.getUniqueIndex(),
      }));
      this.listValues = listValues;
    }
  },
  methods: {
    /**
     * add empty list to list of lists component after index
     */
    addElementToList(index) {
      const newElement = { value: this.getValueBasedOnType(this.items), listUniqueIndex: this.getUniqueIndex() };
      if (this.listValues.length === 0) {
        this.listValues.push(newElement);
      } else {
        this.listValues.splice(index + 1, 0, newElement);
      }
      this.emitInput(this.listValues);
    },
    emitInput(value) {
      const emitValue = cloneDeep(value).map((val) => (val.value));
      if (emitValue.length === 0) {
        this.$emit('input', '');
      } else {
        this.$emit('input', emitValue);
      }
    },
    /**
     * Ensures our keys in v-if iteration have unique values
     *
     * @returns {number} New unique index
     */
    getUniqueIndex() {
      this.listUniqueIndex += 1;
      return this.listUniqueIndex;
    },
    /**
     * determine whether the array is too complex to render
     */
    isValidField(schema) {
      const results = [];

      forEach(schema.items, (val, key) => {
        if (key === 'type' && (val === 'array' || val === 'object')) {
          results.push(false);
        }
        results.push(true);
      });

      return !results.includes(false);
    },
    /**
     * remove element from list component at index
     */
    removeElementFromList(index) {
      this.listValues.splice(index, 1);
      this.emitInput(this.listValues);
    },
  },
};
</script>
<style lang="scss" scoped>
.list-button-container {
  width: 128px;
}
</style>
