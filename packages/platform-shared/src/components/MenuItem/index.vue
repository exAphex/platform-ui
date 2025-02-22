<!-- Copyright (c) 2021-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <!-- Item is a divider -->
  <BDropdownDivider
    v-if="isDivider && showItemForUser" />
  <!-- Item opens a modal -->
  <li
    v-else-if="modal && showItemForUser && showItemForPrivileges"
    :role="isNav ? '' : 'presentation'">
    <BButton
      :class="[{ 'nav-link': isNav, 'dropdown-item': !isNav }, 'd-flex align-items-center rounded-0']"
      @click="$root.$emit('bv::show::modal', modal)"
      :role="isNav ? '' : 'menuitem'">
      <FrIcon
        v-if="icon"
        class="mr-3"
        :name="icon" />
      <span class="menu-item-text">
        {{ $t(displayName) }}
      </span>
    </BButton>
  </li>
  <!-- Item will change route or open a new tab -->
  <Component
    v-else-if="(url || routeTo && routeTo.name) && showItemForUser && showItemForStoreValues"
    :is="bootstrapComponent"
    :href="url"
    :link-class="'d-flex align-items-center'"
    :link-classes="'d-flex align-items-center'"
    :target="url ? '_blank' : ''"
    :to="routeTo">
    <FrIcon
      v-if="icon"
      class="mr-3"
      :name="icon" />
    <span class="menu-item-text">
      {{ $t(displayName) }}
    </span>
    <span
      v-if="showBadgeWithContentFromStore && badgeContent(showBadgeWithContentFromStore)"
      class="badge badge-pill badge-danger ml-3">
      {{ badgeContent(showBadgeWithContentFromStore) }}
    </span>
  </Component>
  <!-- Basic menu item that just emits event -->
  <Component
    v-else-if="event && showItemForUser"
    :is="bootstrapComponent"
    :active="active"
    @click="$emit('item-click', event)"
    :link-class="'d-flex align-items-center'">
    <FrIcon
      v-if="icon"
      class="mr-3"
      :name="icon" />
    <span class="menu-item-text">
      {{ $t(displayName) }}
    </span>
  </Component>
  <!-- Item is an expandable menu with a submenu -->
  <li
    v-else-if="subItems.length && showItemForUser"
    class="fr-menu-item-group"
    :role="isNav ? '' : 'presentation'">
    <BButton
      v-b-toggle="`collapse-${displayName.split(' ').join('-')}`"
      class="dropdown-toggle d-flex align-items-center rounded-0"
      :aria-expanded="isExpanded"
      :role="isNav ? '' : 'menuitem'">
      <FrIcon
        v-if="icon"
        class="mr-3"
        :name="icon" />
      <span class="menu-item-text">
        {{ $t(displayName) }}
      </span>
    </BButton>
    <BCollapse
      :id="`collapse-${displayName.split(' ').join('-')}`"
      class="fr-menu-item-submenuitems"
      tag="ul"
      v-model="isExpanded">
      <template v-for="(subItem, subIndex) in subItems">
        <Component
          v-if="subItem.event"
          :active="subItem.active"
          :key="`menu_item_event_${displayName}_${subIndex}`"
          :is="bootstrapComponent"
          @click="$emit('item-click', subItem.event)">
          <FrIcon
            v-if="subItem.icon"
            class="mr-3"
            :name="subItem.icon" />
          <span class="menu-item-text">
            {{ $t(subItem.displayName) }}
          </span>
        </Component>
        <Component
          v-else-if="showSubItemForUser(subItem.showForRoles)"
          :key="`menu_item_${displayName}_${subIndex}`"
          :is="bootstrapComponent"
          :href="subItem.url"
          :target="subItem.url ? '_blank' : ''"
          :to="subItem.routeTo">
          <FrIcon
            v-if="subItem.icon"
            class="mr-3"
            :name="subItem.icon" />
          <span class="menu-item-text">
            {{ $t(subItem.displayName) }}
          </span>
          <span
            v-if="badgeContent(subItem.showBadgeWithContentFromStore)"
            class="badge badge-pill badge-danger ml-3">
            {{ badgeContent(subItem.showBadgeWithContentFromStore) }}
          </span>
        </Component>
      </template>
    </BCollapse>
  </li>
</template>

<script>
import {
  BButton,
  BCollapse,
  BNavItem,
  BDropdownItem,
  BDropdownDivider,
  VBToggle,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import Vue from 'vue';
import { get } from 'lodash';

Vue.directive('b-toggle', VBToggle);

/**
 * MenuItem - a component which contains the logic used to render menu items
 * displayed in the SideMenu and DropdownMenu components
 */
export default {
  name: 'MenuItem',
  components: {
    BButton,
    BCollapse,
    BNavItem,
    BDropdownItem,
    BDropdownDivider,
    FrIcon,
  },
  props: {
    /**
     * The name to render for the item.
     * Not used if the item is a divider.
     */
    displayName: {
      type: String,
      default: '',
    },
    /**
     * The (optional) icon to render for the item.
     * Not shown if the item is a divider.
     */
    icon: {
      type: String,
      default: '',
    },
    /**
     * The list of privileges for which this item should be displayed.
     */
    showForPrivileges: {
      type: Array,
      default: () => [],
    },
    /**
     * The list of roles for which this item should be displayed.
     */
    showForRoles: {
      type: Array,
      default: () => [],
    },
    /**
     * The list of store-values for which this item should be displayed.
     */
    showForStoreValues: {
      type: Array,
      default: () => [],
    },
    /**
     * The url users are directed to when clicking the item. Opens in a new tab.
     */
    url: {
      type: String,
      default: '',
    },
    /**
     * The vue-router object which is set when users click the item. Should not be used together with the url prop.
     */
    routeTo: {
      type: Object,
      default: () => {},
    },
    /**
     * A list of collapsible sub menu items to display with this item.
     */
    subItems: {
      type: Array,
      default: () => [],
    },
    /**
     * The id of a bootstrap vue modal to show when users click the item.
     */
    modal: {
      type: String,
      default: '',
    },
    /**
     * Indicates that the item should render as a BDropdownDivider
     */
    isDivider: {
      type: Boolean,
      default: false,
    },
    /**
     * The roles of the current user, used to check whether to display the item
     */
    userRoles: {
      type: Array,
      default: () => [],
    },
    /**
     * Indicates if this item is being shown in a nav. If false, the component assumes it is being used in a dropdown.
     */
    isNav: {
      type: Boolean,
      default: false,
    },
    /**
     * Event that item should emit when clicked. Used when menu is not used for routing
     */
    event: {
      type: String,
      default: '',
    },
    /**
     * Is menu item active
     */
    active: {
      type: Boolean,
      default: false,
    },
    /**
     * If menu item is a dropdown, should it be expanded
     */
    expand: {
      type: Boolean,
      default: false,
    },
    /**
     * Shows a badge next to the dropdown option text which displays content from the store
     */
    showBadgeWithContentFromStore: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      bootstrapComponent: this.isNav ? BNavItem : BDropdownItem,
      isExpanded: !!this.shouldBeExpanded(this.$route.name),
    };
  },
  computed: {
    showItemForPrivileges() {
      const emptyShowForPrivilegesProp = !this.showForPrivileges.length;
      const showForPrivilegesInUserStore = this.showForPrivileges.some((userPrivilege) => !!get(this.$store.state.UserStore.privileges, userPrivilege, false));
      const isAmAdmin = this.$store.state.UserStore.amAdmin;
      return emptyShowForPrivilegesProp || showForPrivilegesInUserStore || isAmAdmin;
    },
    // If the item is restricted by roles, only display it to users who have at least one of the required roles
    showItemForUser() {
      return !this.showForRoles.length || this.userRoles.some((userRole) => this.showForRoles.includes(userRole));
    },
    // If the item is restricted by store values, only display it when all of those exist and are truthy
    showItemForStoreValues() {
      return !this.showForStoreValues.length || this.showForStoreValues.every((storeValue) => !!get(this.$store.state, storeValue, false));
    },
  },
  watch: {
    // Use the route name to ensure the this item is expanded if a child item is the current route
    '$route.name': function expandMenu(newRouteName) {
      if (!this.isExpanded && this.shouldBeExpanded(newRouteName)) {
        this.isExpanded = true;
      }
    },
  },
  methods: {
    badgeContent(showBadgeWithContentFromStore) {
      return showBadgeWithContentFromStore ? this.$store.state[showBadgeWithContentFromStore] : '';
    },
    // If the item is restricted by roles, only display it to users who have at least one of the required roles
    showSubItemForUser(showForRoles) {
      return !showForRoles?.length || this.userRoles.some((userRole) => showForRoles.includes(userRole));
    },
    /**
     * Determine whether or not the current item should be expanded if it is a menu, based on the route name
     * @param {String} routeName the name of the current route
     * @returns {Boolean} whether or not the current item should be expanded
     */
    shouldBeExpanded(routeName) {
      return this.subItems?.length && (this.subItems.some((subMenuItem) => subMenuItem?.routeTo?.name === routeName) || this.expand);
    },
  },
};
</script>

<style lang="scss" scoped>
ul,
li {
  list-style: none;
  margin: 0;
  padding: 0;

  .material-icons-outlined {
    line-height: 1.35rem;
  }
}

::v-deep a.nav-link,
button.btn.btn-secondary.nav-link,
button.btn.btn-secondary.dropdown-toggle {
  color: $fr-sidemenu-font-color;
  background-color: inherit;
  border-color: $white;
  width: 100%;
  position: relative;
  border-width: 0;
  border-left: 3px solid transparent;
  cursor: pointer;
  display: block;
  padding: 15px 20px 15px 16px;
  text-decoration: none;
  line-height: 1.5;
  font-size: 0.875rem;

  &.router-link-active {
    background-color: $fr-sidemenu-hover;
    border-left-color: $primary;
  }

  &.hidden {
    display: none !important;
  }

  &:focus-visible {
    outline: 2px auto -webkit-focus-ring-color;
  }

  &:focus {
    box-shadow: none;
  }

  &:hover {
    background-color: $fr-sidemenu-hover;
  }
}

.fr-menu-item-group {
  .btn {
    padding: 15px 60px 15px 19px;
  }

  ::v-deep a {
    padding: 10px 5px 10px 49px;
    height: 41px;
  }
}

ul.fr-menu-item-submenuitems {
  font-size: 0.875rem;
  overflow-x: hidden;
  overflow-y: hidden;
  white-space: nowrap;
}
</style>
