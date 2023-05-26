<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer>
    <template v-if="tableLoading">
      <FrSpinner class="py-5" />
    </template>
    <div v-else class="my-5">
      <FrHeader :title="$t('Requests')" :subtitle="$t('Review your joiner requests')" />
      <BCard no-body>
        <BCardHeader class="p-0">
          <div class="btn-toolbar justify-content-between p-3 border-bottom-0">
            <div>

            </div>
            <!-- <FrSearchInput
              v-model="searchQuery"
              :placeholder="$t('common.search')"
              @clear="clear"
              @search="search" /> -->
          </div>
        </BCardHeader>
        <BTable v-if="accessReviewList.length" class="mb-0" hover responsive tbody-tr-class="cursor-pointer"
          primary-key="id" :fields="fields" :items="accessReviewList">
          <template #cell(name)="{ item }">
            <BMedia class="align-items-center" no-body>
              <div class="media-body align-self-center">
                <h5 class="m-0">
                  {{ item.givenName + " " + item.sn }}
                </h5>
                <small class="text-muted">
                  {{ item.userName }}
                </small>
              </div>
            </BMedia>
          </template>
          <template #cell(requestfor)="{ item }">
            <BMedia class="align-items-center" no-body>
              <div class="media-body align-self-center">
                <h5 class="m-0">
                  {{ item.frIndexedString2 }}
                </h5>
              </div>
            </BMedia>
          </template>
          <template #cell(requestedon)="{ item }">
            <BMedia class="align-items-center" no-body>
              <div class="media-body align-self-center">
                <h5 class="m-0">
                  {{ item.frIndexedString3 }}
                </h5>
              </div>
            </BMedia>
          </template>
          <template #cell(progress)="{ item }">
          </template>
          <template #cell(edit)="{ item }">
            <FrActionsCell :edit-option="false" :delete-option="false" :divider="false">
              <template #custom-top-actions>
                <BDropdownItem @click="sendDecision(item, true)">
                  <FrIcon class="mr-2" name="done" />
                  {{ $t('Approve') }}
                </BDropdownItem>
                <BDropdownItem @click="sendDecision(item, false)">
                  <FrIcon class="mr-2" name="close" />
                  {{ $t('Decline') }}
                </BDropdownItem>
              </template>
            </FrActionsCell>
          </template>
        </BTable>
        <FrNoData v-else :card="false" class="mb-4" data-testid="access-review-no-data" icon="inbox"
          :subtitle="$t('governance.certificationTask.noAccessReview', { type: statusSort.text })" />
        <BPagination v-if="totalRows > 10" v-model="currentPage"
          class="pt-3 justify-content-center pagination-material-buttons border-top" per-page="10" :total-rows="totalRows"
          @input="() => getList()" />
      </BCard>
    </div>
  </BContainer>
</template>

<script>
import { mapState } from 'vuex';
import {
  BBadge,
  BCard,
  BCardHeader,
  BContainer,
  BDropdown,
  BDropdownItem,
  BMedia,
  BPagination,
  BPopover,
  BTable,
} from 'bootstrap-vue';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import FrActionsCell from '@forgerock/platform-shared/src/components/cells/ActionsCell';
import FrCircleProgressBar from '@forgerock/platform-shared/src/components/CircleProgressBar';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
// import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import styles from '@/scss/main.scss';
import CertificationMixin from '@forgerock/platform-shared/src/mixins/Governance/Certification';

export default {
  name: 'RequestReviews',
  components: {
    BBadge,
    BCard,
    BCardHeader,
    BContainer,
    BDropdown,
    BDropdownItem,
    BMedia,
    BPagination,
    BPopover,
    BTable,
    FrActionsCell,
    FrCircleProgressBar,
    FrHeader,
    FrIcon,
    FrNoData,
    // FrSearchInput,
    FrSpinner,
  },
  data() {
    return {
      currentPage: 1,
      totalRows: 0,
      tableLoading: true,
      selectedCertId: null,
      accessReviewList: [],
      fields: [
        {
          key: 'name',
          label: this.$t('common.name'),
        },
        {
          key: 'requestfor',
          label: this.$t('Requested for'),
          sortable: true,
        },
        {
          key: 'requestedon',
          class: 'w-190px',
          label: this.$t('Requested on'),
          sortable: true,
        },
        {
          key: 'edit',
          class: 'w-96px',
          label: '',
        }],
      styles,
    };
  },
  mixins: [
    RestMixin,
    NotificationMixin,
    CertificationMixin,
  ],
  mounted() {
    this.getRequests();
  },
  computed: {
    ...mapState({
      userId: (state) => state.UserStore.userId,
    }),
    currentUserId() {
      return `managed/user/${this.userId}`;
    },
  },
  methods: {
    getRequests() {
      this.getRequestService().get(`endpoint/GetJoinerApprovals`).then(({ data }) => {
        this.accessReviewList = data.results;
        this.$store.commit('setRequestCount', data.results.length);
        this.tableLoading = false;
      }).catch((error) => {
        this.showErrorMessage(error, this.$t('pages.profile.failedGettingProfile'));
      });
    },

    sendDecision(item, decision) {
      this.tableLoading = true;
      const paramDecision = (decision ? "approve" : "decline");
      this.getRequestService().post(`endpoint/ApproveJoiner?user=` + item._id + "&decision=" + paramDecision, {}, {
        headers: {
          'Content-Type': 'application/json',
        }
      }).then(_ => {
        this.getRequests();
        
      }).catch((error) => {
        this.showErrorMessage(error, this.$t('pages.profile.failedGettingProfile'));
        this.tableLoading = false;
      });
    },
  },
};
</script>
<style lang="scss" scoped>
#dropdown-status::v-deep {
  button {
    color: $black;
    padding-left: 0;
    padding-right: 0;
  }
}

::v-deep {
  .w-140px {
    width: 140px;
  }

  .w-96px {
    width: 96px;
  }
}
</style>
