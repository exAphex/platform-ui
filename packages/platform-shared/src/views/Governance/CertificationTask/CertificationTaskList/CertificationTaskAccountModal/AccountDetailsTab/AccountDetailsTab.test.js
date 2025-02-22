/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import dayjs from 'dayjs';
import AccountDetailsTab from './index';

const account = {
  id: 'test',
  account: {
    displayName: 'Franklin Horne',
    userPrincipalName: 'fhorne@jstilton1973unfinishedlife.onmicrosoft.com',
  },
  accountEnabled: true,
  accountType: 'type',
  decision: 'certify',
  decisionBy: {
    givenName: 'Foo',
    id: 'managed/user/1',
    mail: 'foo@test.com',
    sn: 'Test',
    userName: 'FooTest',
  },
  decisionDate: '2023-02-28T15:12:25+00:00',
  displayName: 'Franklin Horne',
  givenName: 'Franklin',
  linkQualifier: 'default',
  mail: 'franklin.horne@usercreator.gen',
  mailNickname: 'fhorne',
  manager: null,
  metadata: {},
  otherMails: [],
  proxyAddresses: [],
  surname: 'Horne',
  userPrincipalName: 'fhorne@jstilton1973unfinishedlife.onmicrosoft.com',
  userType: 'Member',
};

const validateFieldByText = (wrapper, field, value) => {
  const fieldRef = findByTestId(wrapper, field);

  expect(fieldRef.text()).toEqual(value);
};

describe('AccountDetailsTab', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(AccountDetailsTab, {
      mocks: {
        $t: (t) => t,
      },
      propsData: {
        account,
      },
    });
  });

  it('component should load correctly', () => {
    expect(wrapper.name()).toBe('AccountDetailsTab');
  });

  it('should show all account details properties', () => {
    validateFieldByText(wrapper, 'displayName', account.account.displayName);
    validateFieldByText(wrapper, 'userPrincipalName', account.account.userPrincipalName);
    validateFieldByText(wrapper, 'lastDecision', account.decision);
    validateFieldByText(wrapper, 'decisionDate', dayjs(account.decisionDate).format('MMMM D, YYYY h:mm A'));
    validateFieldByText(wrapper, 'decisionBy', account.decisionBy.userName);
  });
});
