<!-- Copyright (c) 2020-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BButton
    v-if="showOnlyPositiveAnswer"
    class="btn-block mt-3"
    :variant="showButtonsAsLinks ? 'link' : variant"
    @click="setValue(0)"
    :aria-label="firstOption"
    :data-testid="`btn-${firstOption.toLowerCase().replace(/\s/g, '')}`">
    {{ firstOption }}
  </BButton>
  <div
    v-else
    :class="[{ 'd-flex': showButtonsAsLinks }]"
  >
    <BButton
      v-for="(option, index) in options"
      :key="index"
      class="btn-block mt-3"
      :variant="showButtonsAsLinks ? 'link' : variant"
      @click="setValue(index)"
      :aria-label="option"
      :data-testid="`btn-${option.toLowerCase().replace(/\s/g, '')}`">
      {{ option }}
    </BButton>
  </div>
</template>

<script>
import { BButton } from 'bootstrap-vue';

export default {
  name: 'ConfirmationCallback',
  components: {
    BButton,
  },
  props: {
    callback: {
      type: Object,
      required: true,
    },
    /**
     * Stage info
     */
    stage: {
      type: Object,
      default: null,
    },
    variant: {
      type: String,
      default: 'primary',
    },
  },
  mounted() {
    this.options = this.callback.getOptions();
    if (this.showOnlyPositiveAnswer) {
      // eslint-disable-next-line prefer-destructuring
      this.firstOption = this.options[0];
    }
  },
  data() {
    return {
      options: [],
      showButtonsAsLinks: this.stage?.showButtonsAsLinks,
      showOnlyPositiveAnswer: this.stage?.showOnlyPositiveAnswer,
      firstOption: '',
    };
  },
  methods: {
    setValue(value) {
      this.callback.setInputValue(value);
      this.$emit('next-step');
    },
  },
};
</script>
