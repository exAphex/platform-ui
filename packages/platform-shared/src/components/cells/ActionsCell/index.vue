<!-- Copyright (c) 2021-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    align="right"
    :class="wrapperClass ? wrapperClass : 'pr-3'">
    <BDropdown
      boundary="window"
      class="p-0"
      no-caret
      right
      toggle-class="text-decoration-none p-0"
      variant="link"
      :data-testid="`${testId}-actions`">
      <template #button-content>
        <FrIcon
          class="text-dark md-24"
          name="more_horiz" />
      </template>
      <!--
        Slot for any custom actions not covered by common use cases
      -->
      <slot name="custom-top-actions" />
      <!--
        Triggered on click, indicates user would like to edit this row's item
        @event edit-clicked
      -->
      <BDropdownItem
        v-if="editOption"
        :data-testid="`dropdown-edit-${testId}`"
        @click="$emit('edit-clicked')">
        <FrIcon
          class="mr-2"
          name="edit" />
        {{ $t('common.edit') }}
      </BDropdownItem>
      <!--
        Triggered on click, indicates user would like to duplicate this row's item
        @event duplicate-clicked
      -->
      <BDropdownItem
        v-if="duplicateOption"
        :data-testid="`dropdown-duplicate-${testId}`"
        @click="$emit('duplicate-clicked')">
        <FrIcon
          class="mr-2"
          name="control_point_duplicate" />
        {{ $t('common.duplicate') }}
      </BDropdownItem>
      <!--
        Triggered on click, indicates user would like to toggle this row's item active or inactive
        @event toggle-clicked
      -->
      <BDropdownItem
        v-if="showActiveToggle"
        :data-testid="`dropdown-active-toggle-${testId}`"
        @click="$emit('toggle-clicked')">
        <FrIcon
          class="mr-2"
          name="power_settings_new" />
        {{ toggleIsActive ? $t('common.deactivate') : $t('common.activate') }}
      </BDropdownItem>
      <!--
        Slot for any custom actions not covered by common use cases
      -->
      <slot name="custom-bottom-actions" />
      <BDropdownDivider v-if="divider" />
      <!--
        Triggered on click, indicates user would like to delete this row's item
        @event delete-clicked
      -->
      <BDropdownItem
        v-if="deleteOption"
        @click="$emit('delete-clicked', $event)"
        :data-testid="`dropdown-delete-${testId}`">
        <FrIcon
          class="mr-2"
          name="delete" />
        {{ $t('common.delete') }}
      </Bdropdownitem>
    </BDropdown>
  </div>
</template>

<script>
import {
  BDropdown,
  BDropdownDivider,
  BDropdownItem,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';

/**
 * This cell slot component is designed to be used within the bootstrap table component (though can be used
 * in other areas that have a similar dropdown). Standardizes appearance and functionality of table row actions.
 */
export default {
  name: 'ActionsCell',
  components: {
    FrIcon,
    BDropdown,
    BDropdownDivider,
    BDropdownItem,
  },
  props: {
    /**
     * Enables a dropdown option to delete the current row
     */
    deleteOption: {
      default: true,
      type: Boolean,
    },
    /**
     * Enables a divider to appear above the delete option
     */
    divider: {
      default: true,
      type: Boolean,
    },
    /**
     * Enables a dropdown option to duplicate the item in the current row
     */
    duplicateOption: {
      default: false,
      type: Boolean,
    },
    /**
     * Enables a dropdown option to edit the item in the current row
     */
    editOption: {
      default: true,
      type: Boolean,
    },
    /**
     * Enables a dropdown option to activate or deactivate the item in the current row
     */
    showActiveToggle: {
      default: false,
      type: Boolean,
    },
    /**
     * Shows whether the active toggle is currently active or inactive
     */
    toggleIsActive: {
      default: true,
      type: Boolean,
    },
    /**
     * A class to use for the wrapping component of the cell
     */
    wrapperClass: {
      type: String,
      default: '',
    },
    testId: {
      type: String,
      default: '',
    },
  },
};
</script>
