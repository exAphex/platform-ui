<!-- Copyright (c) 2020-2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div v-if="oauthApplications.length">
    <FrAccordion
      accordion-group="oauthApplications"
      class="oauth-applications"
      :items="oauthApplications">
      <template #accordionHeader>
        <div class="p-4">
          <h1 class="h4">
            {{ $t("pages.profile.oauthApplications.title") }}
          </h1>
          <p class="m-0">
            {{ $t("pages.profile.oauthApplications.subtitle") }}
          </p>
        </div>
      </template>
      <template #header="slotData">
        <h5 class="mb-0">
          <BImg
            :alt="slotData.name || slotData._id"
            :src="slotData.logoUri || defaultAppImg"
            class="mr-4"
            height="24"
            width="24"
            @error="failedImageHandler"
          />
          {{ slotData.name || slotData._id }}
        </h5>
      </template>
      <template #body="slotData">
        <div class="row">
          <div class="col-md-6">
            <dl>
              <dt class="mb-2">
                <small>
                  {{
                    $t('pages.profile.oauthApplications.sharedWith',
                       {applicationName: slotData.name || slotData._id})
                  }}
                </small>
              </dt>
              <template v-for="(scope, i) in slotData.scopes">
                <dd :key="i">
                  <div class="media">
                    <FrIcon
                      class="mr-2 mt-1 text-success"
                      name="check"
                    />
                    <div class="media-body">
                      <div class="media-item">
                        {{ scope }}
                      </div>
                    </div>
                  </div>
                </dd>
              </template>
            </dl>
          </div>
          <div class="col-md-6">
            <dl>
              <dt class="mb-2">
                <small>{{ $t('common.expires') }}</small>
              </dt>
              <dd>
                <div class="media">
                  <FrIcon
                    class="mr-2 mt-1 text-muted"
                    name="access_time"
                  />
                  <div class="media-body">
                    <div class="media-item">
                      {{ formateExpiryDate(slotData.expiryDateTime) }}
                    </div>
                  </div>
                </div>
              </dd>
            </dl>
          </div>
        </div>
        <div class="d-flex justify-content-start">
          <BButton
            class="w-100"
            @click="showConfirmationModal(slotData)"
            type="button"
            variant="outline-danger"
          >
            <FrIcon
              class="mr-2"
              name="block"
            />
            {{ $t('pages.profile.oauthApplications.revokeAccess') }}
          </BButton>
        </div>
      </template>
    </FrAccordion>
    <BModal
      id="authAppConfirmationModal"
      ref="fsModal"
      :title="$t('pages.profile.oauthApplications.removeConfirmationTitle', {applicationName: confirmApplication.name})">
      {{ $t('pages.profile.oauthApplications.removeConfirmation', {applicationName: confirmApplication.name }) }}
      <template v-slot:modal-footer="{ cancel }">
        <BButton
          class="text-danger"
          variant="link"
          @click="cancel()">
          {{ $t('common.cancel') }}
        </BButton>
        <BButton
          variant="danger"
          @click="removeApplication(confirmApplication.id)">
          {{ $t('pages.profile.oauthApplications.revokeAccess') }}
        </BButton>
      </template>
    </BModal>
  </div>
</template>

<script>
/* eslint-disable no-underscore-dangle */
import { mapState } from 'vuex';
import FrAccordion from '@forgerock/platform-shared/src/components/Accordion';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import defaultAppImg from '@forgerock/platform-shared/src/assets/images/default-app.svg';

export default {
  name: 'AuthorizedApplications',
  mixins: [RestMixin, NotificationMixin],
  components: {
    FrAccordion,
    FrIcon,
  },
  data() {
    return {
      oauthApplications: [],
      confirmApplication: {
        name: '',
        id: null,
      },
      defaultAppImg,
    };
  },
  computed: {
    ...mapState({
      userId: (state) => state.UserStore.userSearchAttribute,
      userName: (state) => state.UserStore.userName,
    }),
  },
  mounted() {
    this.loadData();
  },
  methods: {
    formateExpiryDate(date) {
      if (date === null) return this.$t('user.profile.authorizedApplications.never');

      const expiry = new Date(date);
      const month = expiry.toLocaleString('default', { month: 'long' });
      const day = expiry.getDay();
      const year = expiry.getFullYear();
      return `${month} ${day}, ${year}`;
    },
    loadData() {
      const selfServiceInstance = this.getRequestService({ context: 'AM' });
      const url = `/users/${this.userId}/oauth2/applications?_queryFilter=true`;

      selfServiceInstance.get(url, { withCredentials: true }).then((res) => {
        // filter out end-user-ui and idm-admin-ui
        const applications = res.data.result.filter((application) => (application._id !== 'end-user-ui' && application._id !== 'idm-admin-ui'));
        this.$set(this.$data, 'oauthApplications', applications);
      }).catch((error) => {
        this.showErrorMessage(error);
      });
    },
    showConfirmationModal(application) {
      this.confirmApplication.id = application._id;
      this.confirmApplication.name = application.name || application._id;
      this.$refs.fsModal.show();
    },
    removeApplication(clientId) {
      const selfServiceInstance = this.getRequestService({ context: 'AM' });
      const url = `/users/${this.userId}/oauth2/applications/${clientId}`;

      selfServiceInstance.delete(url, { withCredentials: true }).then(() => {
        this.$refs.fsModal.hide();
        this.loadData();
        this.displayNotification(
          'AMMessages',
          'success',
          this.$t('pages.profile.oauthApplications.removeSuccess', {
            applicationName: this.confirmApplication.id,
          }),
        );
      }).catch((error) => {
        this.showErrorMessage(error);
      });
    },
    failedImageHandler(e) {
      e.target.src = defaultAppImg;
    },
  },
};
</script>
