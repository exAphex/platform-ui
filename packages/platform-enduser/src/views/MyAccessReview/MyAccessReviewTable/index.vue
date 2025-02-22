<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer :class="`${isDetailPage ? 'p-0' : 'my-5'} my-access`">
    <FrHeader
      v-if="!isDetailPage"
      class="mb-4"
      :title="$t(`pages.myAccess.${grantType}.title`)"
      :subtitle="$t(`pages.myAccess.${grantType}.subtitle`)" />
    <BCard no-body>
      <BCardHeader class="p-0">
        <BButtonToolbar
          v-if="!isNoResultsFirstLoad"
          class="justify-content-end p-3 border-bottom-0"
          data-testid="my-access-review-table-search-container">
          <FrSearchInput
            v-model="searchQuery"
            data-testid="search-my-access-review-table"
            :placeholder="$t('common.search')"
            @clear="clear"
            @search="loadData()" />
        </BButtonToolbar>
      </BCardHeader>
      <div
        v-if="isLoading"
        data-testid="my-access-review-table-spinner">
        <FrSpinner class="py-5" />
        <div class="text-center pb-4 font-bold">
          {{ $t('common.loading') }}
        </div>
      </div>
      <FrNoData
        v-else-if="items.length===0"
        icon="people"
        body-class="mb-5"
        data-testid="my-access-review-table-no-results-first-load"
        :title="$t(`pages.myAccess.${grantType}.noRecordFound`)"
        :subtitle="isNoResultsFirstLoad ? $t(`pages.myAccess.${grantType}.noResultsUser`) : $t('governance.directReports.noResultsHelp')"
        :card="false" />
      <BTable
        v-else
        data-testid="my-access-review-table"
        @sort-changed="sortChanged"
        responsive
        :fields="fields"
        :items="items"
        :busy="isLoading"
        :no-local-sorting="true"
        :sort-by.sync="sortBy"
        :sort-desc.sync="sortDesc">
        <template #cell(accountName)="{ item }">
          <BMedia
            no-body
            class="text-truncate">
            <BMediaBody class="text-truncate">
              <p class="mb-0 text-truncate text-dark">
                {{ getResourceDisplayName(item, '/account') }}
              </p>
            </BMediaBody>
          </BMedia>
        </template>
        <template #cell(appName)="{ item }">
          <div>
            <BMedia no-body>
              <BMediaAside
                vertical-align="center"
                class="mr-4">
                <BImg
                  :alt="$t('common.logo')"
                  :src="getApplicationLogo(item.application) || require('@forgerock/platform-shared/src/assets/images/placeholder.svg')"
                  :aria-hidden="true"
                  width="36"
                  height="36"
                />
              </BMediaAside>
              <BMediaBody class="text-truncate">
                <h5 class="mb-0 text-truncate">
                  {{ item.application.name }}
                </h5>
                <small class="text-muted text-truncate">
                  {{ getDisplayName(item) }}
                </small>
              </BMediaBody>
            </BMedia>
          </div>
        </template>
        <template #cell(entitlementName)="{ item }">
          <BMedia
            no-body
            class="text-truncate">
            <BMediaBody class="text-truncate">
              <p class="mb-0 text-truncate text-dark">
                {{ getResourceDisplayName(item, '/entitlement') }}
              </p>
            </BMediaBody>
          </BMedia>
        </template>
        <template #cell(roleName)="{ item }">
          <BMedia
            no-body
            class="d-flex align-items-end">
            <div class="d-flex align-items-center justify-content-center rounded rounded-circle bg-light mr-3 text-dark icon">
              <BMediaAside
                vertical-align="center"
                class="ml-3">
                <FrIcon name="assignment_ind" />
              </BMediaAside>
            </div>
            <BMediaBody
              class="text-truncate"
              vertical-align="center">
              <h5 class="text-truncate">
                {{ item.role.name }}
              </h5>
            </BMediaBody>
          </BMedia>
        </template>
        <template #cell(status)="{}" />
        <template #cell(timeConstraint)="{ item }">
          <BMedia
            no-body
            class="text-truncate">
            <BMediaBody class="text-truncate">
              <p class="mb-0 text-truncate">
                {{ item.relationship.temporalConstraints || blankValueIndicator }}
              </p>
            </BMediaBody>
          </BMedia>
        </template>
      </BTable>
      <FrPagination
        v-model="paginationPage"
        aria-controls="my-access-review-table"
        :per-page="paginationPageSize"
        :total-rows="totalCount"
        @input="pageChange"
        @on-page-size-change="pageSizeChange"
      />
    </BCard>
  </BContainer>
</template>

<script>
import {
  BButtonToolbar,
  BCard,
  BCardHeader,
  BContainer,
  BImg,
  BMedia,
  BMediaAside,
  BMediaBody,
  BTable,
} from 'bootstrap-vue';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import AppSharedUtilsMixin from '@forgerock/platform-shared/src/mixins/AppSharedUtilsMixin';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import * as GovernanceEnduserApi from '@/api/GovernanceEnduserApi';

export default {
  name: 'MyAccessReviewTable',
  components: {
    BButtonToolbar,
    BCard,
    BCardHeader,
    BContainer,
    BImg,
    BMedia,
    BMediaAside,
    BMediaBody,
    BTable,
    FrHeader,
    FrIcon,
    FrPagination,
    FrSearchInput,
    FrSpinner,
    FrNoData,
  },
  mixins: [
    AppSharedUtilsMixin,
    NotificationMixin,
  ],
  props: {
    defaultSort: {
      type: String,
      required: true,
    },
    grantType: {
      type: String,
      required: true,
    },
    resourceName: {
      type: String,
      default: '',
    },
    fields: {
      type: Array,
      required: true,
    },
    userId: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      blankValueIndicator,
      isLoading: true,
      isNoResultsFirstLoad: false,
      items: [],
      paginationPage: 1,
      paginationPageSize: 10,
      searchQuery: '',
      sortDesc: null,
      sortBy: null,
      totalCount: 0,
      isDetailPage: false,
    };
  },
  created() {
    if (this.resourceName === 'directReportDetail') {
      this.isDetailPage = true;
    }
  },
  mounted() {
    this.setup();
  },
  methods: {
    clear() {
      this.paginationPage = 1;
      this.searchQuery = '';
      this.loadData();
    },
    getDisplayName(item) {
      if (this.grantType === 'account') {
        return this.getResourceDisplayName(item, '/account');
      }
      return this.getApplicationDisplayName(item.application);
    },
    /**
     * Loads a list for MyAccess (accounts/entitlements/roles) based on the current path
     * @param {object} params - Parameters to be plugged into query string
     * @param {Boolean} isInit - Parameter check whether the component is inital rendering, passed from loadData()
     */
    getMyAccess(params, isInit = false) {
      params.grantType = this.grantType;
      const userId = this.userId || this.$store.state.UserStore.userId;
      GovernanceEnduserApi.getMyAccess(userId, params).then(({ data }) => {
        this.items = data.result;
        this.totalCount = data.totalCount;
        if (isInit && !this.totalCount) {
          this.isNoResultsFirstLoad = true;
        } else {
          this.isNoResultsFirstLoad = false;
        }
      }).catch((err) => {
        this.showErrorMessage(err, this.$t(`pages.myAccess.${this.grantType}.errorGettingData`));
      }).finally(() => {
        this.isLoading = false;
      });
    },
    /**
     * Loads a list for MyAccess
     * @param {Boolean} isInit - Optional parameter check whether the component is inital rendering, default is false
     */
    loadData(isInit = false) {
      this.isLoading = true;
      const params = {
        pageSize: this.paginationPageSize,
        pageNumber: this.paginationPage - 1,
      };
      if (this.searchQuery !== '') {
        params.queryString = this.searchQuery;
      }
      params.sortDir = this.sortDesc ? 'desc' : 'asc';
      params.sortBy = this.sortBy;
      this.getMyAccess(params, isInit);
    },
    pageChange(page) {
      this.paginationPage = page;
      this.loadData();
    },
    pageSizeChange(pageSize) {
      this.paginationPageSize = pageSize;
      this.loadData();
    },
    setup() {
      this.sortBy = this.defaultSort;
      this.loadData(true);
    },
    sortChanged(event) {
      const { sortBy } = event;
      switch (sortBy) {
        case 'accountName':
          this.sortBy = 'account.userPrincipalName';
          break;
        case 'appName':
          this.sortBy = 'application.name';
          break;
        case 'entitlementName':
          this.sortBy = 'entitlement.__NAME__';
          break;
        case 'roleName':
          this.sortBy = 'role.name';
          break;
        case 'status':
          this.sortBy = '';
          break;
        default:
          this.sortBy = null;
          break;
      }
      this.sortDesc = !this.sortDesc;
      this.loadData();
    },
    getResourceDisplayName(item, resource) {
      return item.descriptor?.idx?.[resource]?.displayName;
    },
  },
};
</script>
<style lang="scss" scoped>
.my-access {
  .icon {
    height: 34px;
    width: 34px;
  }
  .w-100px {
    width: 100px;
  }
}
</style>
