<!-- Copyright (c) 2019-2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<script>
import Notifications from 'vue-notification';
import velocity from 'velocity-animate';
import Vue from 'vue';
import { has } from 'lodash';
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';

Vue.use(Notifications, { velocity });

/**
 * @description Notification mixin used for generating messages to users to convey information
 *
 */
export default {
  name: 'NotificationMixin',
  mixins: [
    TranslationMixin,
  ],
  methods: {
    // Display an application notification
    displayNotification(notificationType, message) {
      let type = notificationType;

      if (type === 'error') {
        type = 'danger';
      }

      this.$notify({
        type,
        text: this.getTranslation(message),
      });
    },
    showErrorMessage(error, defaultMessage) {
      let errorMessage = defaultMessage;

      if (has(error, 'response.data.message') && error.response.data.message.length > 0) {
        // error message may have html encoding for example &#39; aka single quote
        const errorTextElement = document.createElement('div');
        errorTextElement.innerHTML = error.response.data.message;
        errorMessage = errorTextElement.innerText;
      }

      this.displayNotification('danger', this.getTranslation(errorMessage));
    },
  },
};
</script>
