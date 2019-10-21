import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import VeeValidate from 'vee-validate';
import _ from 'lodash';
import Vuex from 'vuex';
import i18n from '@/i18n';
import EditPersonalInfo from '@/components/profile/EditPersonalInfo';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(BootstrapVue);
localVue.use(VeeValidate);

describe('EditPersonalInfo.vue', () => {
  const v = new VeeValidate.Validator();

  const store = new Vuex.Store({});

  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(EditPersonalInfo, {
      localVue,
      provide: () => ({
        $validator: v,
      }),
      i18n,
      store,
      propsData: {
        schema: {
          order: ['test'],
          properties: {
            test: {
              viewable: true,
              type: 'string',
              title: 'test title',
              userEditable: true,
            },
          },
          required: [],
        },
        profile: { test: 'test' },
      },
      computed: {
        userId: '1234',
        managedResource: {},
        internalUser: true,
      },
    });

    jest.spyOn(wrapper.vm, 'saveForm');
  });

  afterEach(() => {
    wrapper = null;
  });

  it('EditPersonalInfo modal loaded', () => {
    expect(wrapper.name()).toBe('EditPersonalInfo');
    expect(wrapper.isVisible()).toBe(true);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a title', () => {
    expect(wrapper.vm.title).toBe('Edit your personal info');
  });

  it('TermsAndConditions validation', (done) => {
    wrapper.vm.isValid().then((response) => {
      expect(response).toBe(true);

      done();
    });
  });

  it('creates patches array correctly', () => {
    const original = [{
      name: 'description',
      value: null,
    }, {
      name: 'telephoneNumber',
      value: '123-456-7890',
    }, {
      name: 'city',
      value: 'Portland',
    }, {
      name: 'postalCode',
      value: null,
    }];

    const newForm = [{
      name: 'description',
      value: 'new description',
    }, {
      name: 'telephoneNumber',
      value: '',
    }, {
      name: 'city',
      value: 'Vancouver',
    }, {
      name: 'postalCode',
      value: null,
    }];

    const patches = wrapper.vm.generateUpdatePatch(original, newForm);

    expect(patches.length).toBe(3);
    expect(patches[0].operation).toBe('add');
    expect(patches[0].field).toBe('/description');
    expect(patches[0].value).toBe('new description');
    expect(patches[1].operation).toBe('remove');
    expect(patches[1].field).toBe('/telephoneNumber');
    expect(patches[2].operation).toBe('add');
    expect(patches[2].field).toBe('/city');
    expect(patches[2].value).toBe('Vancouver');
  });

  describe('#generateFormFields', () => {
    it('should create the proper fields based on schema', () => {
      const formFields = wrapper.vm.generateFormFields();
      const firstFormField = _.first(formFields);

      expect(typeof formFields).toBe('object');
      expect(formFields.length).toBe(1);
      expect(typeof firstFormField).toBe('object');
      expect(firstFormField).toMatchObject({ name: 'test' });
      expect(firstFormField).toMatchObject({ title: 'test title' });
      expect(firstFormField).toMatchObject({ value: 'test' });
      expect(firstFormField).toMatchObject({ type: 'string' });
      expect(firstFormField).toMatchObject({ required: false });
    });
  });
});