<!-- Copyright (c) 2020-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template functional>
  <dl class="row">
    <dt class="col-xl-5 mb-3">
      {{ parent.$t('pages.profile.consent.accountAccess') }}
    </dt>
    <dd class="col-xl-7 mb-4">
      <ul class="list-unstyled text-muted">
        <li
          class="py-1"
          v-for="field in props.fields"
          :key="field.name">
          <FrIcon
            class="md-16 text-success font-weight-bolder mr-2"
            name="check"
          />
          {{ field.title }}
        </li>
      </ul>
    </dd>
  </dl>
</template>

<script>
import FrIcon from '@forgerock/platform-shared/src/components/Icon';

export default {
  components: {
    FrIcon,
  },
};
</script>
