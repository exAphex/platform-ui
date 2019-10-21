import { createLocalVue, shallowMount } from '@vue/test-utils';
import i18n from '@/i18n';
import TrustedDevices from '@/components/profile/TrustedDevices';

const localVue = createLocalVue();

describe('TrustedDevices.vue', () => {
  let wrapper;

  beforeEach(() => {
    jest.spyOn(TrustedDevices, 'mounted')
      .mockImplementation(() => { });

    wrapper = shallowMount(TrustedDevices, {
      localVue,
      i18n,
      stubs: {
        BListGroupItem: true,
        BModal: true,
        BBtn: true,
      },
    });
  });

  it('Trusted Devices loads', () => {
    expect(wrapper.name()).toBe('TrustedDevices');
    expect(wrapper).toMatchSnapshot();
  });

  it('showConfirmationModal sets correct device values', () => {
    wrapper.vm.$refs.fsModal.show = jest.fn();
    wrapper.vm.showConfirmationModal({ uuid: '12345', name: 'test' });

    expect(wrapper.vm.confirmDevice.id).toBe('12345');
    expect(wrapper.vm.confirmDevice.name).toBe('test');
  });
});