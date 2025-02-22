/**
 * Copyright (c) 2021-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  mount,
} from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import DirectReports from './index';
import * as GovernanceEnduserApi from '@/api/GovernanceEnduserApi';

jest.mock('@/api/GovernanceEnduserApi');

describe('DirectReports Component', () => {
  const mockResultItems = [
    {
      _id: '2a5179e1-02d1-4cab-a858-bafb0529d181',
      _rev: '0440862c-e43f-41ea-8828-897a38990f63-60398',
      mail: 'employeeuser1@fr.net',
      profileImage: null,
      givenName: 'employee',
      accountStatus: 'active',
      sn: 'user1',
      userName: 'employee1',
      _refResourceCollection: 'managed/alpha_user',
      _refResourceId: 'aa75d444-379e-491c-8971-f1b85e533c56',
      _refResourceRev: '0440862c-e43f-41ea-8828-897a38990f63-60399',
      _ref: 'managed/alpha_user/aa75d444-379e-491c-8971-f1b85e533c56',
      _refProperties: {
        _id: '2a5179e1-02d1-4cab-a858-bafb0529d181',
        _rev: '0440862c-e43f-41ea-8828-897a38990f63-60398',
      },
    },
    {
      _id: 'a21f812b-19da-4863-aee3-8a7dae1860b6',
      _rev: '0440862c-e43f-41ea-8828-897a38990f63-62225',
      mail: 'employeeuser3@fr.net',
      profileImage: null,
      givenName: 'employee3',
      accountStatus: 'active',
      sn: 'user3',
      userName: 'employee3',
      _refResourceCollection: 'managed/alpha_user',
      _refResourceId: '2ad69c41-227e-42ea-8a11-f1621bd34b18',
      _refResourceRev: '0440862c-e43f-41ea-8828-897a38990f63-62226',
      _ref: 'managed/alpha_user/2ad69c41-227e-42ea-8a11-f1621bd34b18',
      _refProperties: {
        _id: 'a21f812b-19da-4863-aee3-8a7dae1860b6',
        _rev: '0440862c-e43f-41ea-8828-897a38990f63-62225',
      },
    },
  ];

  let wrapper;
  const mockRouter = {
    push: jest.fn(),
  };
  beforeEach(() => {
    jest.clearAllMocks();
    GovernanceEnduserApi.getDirectReports = jest.fn().mockReturnValue(Promise.resolve({ data: { result: [] } }));

    wrapper = mount(DirectReports, {
      mocks: {
        $t: (t) => t,
        $router: mockRouter,
        $store: {
          state: {
            UserStore: {
              userId: 'testId',
            },
          },
        },
      },
    });
  });

  it('should have a loading spinner & a table', async () => {
    await wrapper.setData({ isLoading: true });
    const directReportsSpinner = await findByTestId(wrapper, 'spinner-directreports');
    expect(directReportsSpinner.exists()).toBeTruthy();

    await wrapper.setData({
      isLoading: false,
      items: mockResultItems,
    });
    const directReportsTable = findByTestId(wrapper, 'table-directreports');
    expect(directReportsTable.exists()).toBeTruthy();
  });

  it('should have an input to search delegates', () => {
    const searchDelegate = findByTestId(wrapper, 'search-directreports');
    expect(searchDelegate.exists()).toBeTruthy();
  });

  it('clearing the search input resets the query params', async () => {
    const clearSpy = jest.spyOn(wrapper.vm, 'clear');
    const loadSpy = jest.spyOn(wrapper.vm, 'loadData');
    const searchDelegate = findByTestId(wrapper, 'search-directreports');
    await searchDelegate.vm.$emit('input', 'test');
    await searchDelegate.vm.$emit('clear');

    expect(clearSpy).toHaveBeenCalled();
    expect(wrapper.vm.searchQuery).toBe('');
    expect(wrapper.vm.paginationPage).toBe(1);
    expect(loadSpy).toHaveBeenCalled();
  });

  it('can sort table by descending', async () => {
    const loadSpy = jest.spyOn(wrapper.vm, 'loadData');
    await wrapper.vm.sortChanged();

    expect(wrapper.vm.sortDesc).toBeTruthy();
    expect(loadSpy).toBeCalled();
    expect(GovernanceEnduserApi.getDirectReports).toBeCalledWith('testId', {
      pageNumber: 1, pageSize: 10, sortBy: 'userName', sortDir: 'desc',
    });
  });

  it('can sort table by ascending', async () => {
    wrapper.setData({ sortDesc: true });
    const loadSpy = jest.spyOn(wrapper.vm, 'loadData');
    await wrapper.vm.sortChanged();

    expect(wrapper.vm.sortDesc).toBeFalsy();
    expect(loadSpy).toBeCalled();
    expect(GovernanceEnduserApi.getDirectReports).toBeCalledWith('testId', {
      pageNumber: 1, pageSize: 10, sortBy: 'userName', sortDir: 'asc',
    });
  });

  it('can set page size', () => {
    const loadSpy = jest.spyOn(wrapper.vm, 'loadData');
    wrapper.vm.pageSizeChange(20);

    expect(wrapper.vm.paginationPageSize).toBe(20);
    expect(loadSpy).toBeCalled();
    expect(GovernanceEnduserApi.getDirectReports).toBeCalledWith('testId', {
      pageNumber: 1, pageSize: 20, sortBy: 'userName', sortDir: 'asc',
    });
  });

  it('can set page', async () => {
    const loadSpy = jest.spyOn(wrapper.vm, 'loadData');
    await wrapper.vm.pageChange(2);

    expect(wrapper.vm.paginationPage).toBe(2);
    expect(loadSpy).toBeCalled();
    expect(GovernanceEnduserApi.getDirectReports).toBeCalledWith('testId', {
      pageNumber: 2, pageSize: 10, sortBy: 'userName', sortDir: 'asc',
    });
  });

  it('can display an error if API fails', async () => {
    const error = new Error();
    GovernanceEnduserApi.getDirectReports.mockImplementation(() => Promise.reject(error));
    const spyNotification = jest.spyOn(wrapper.vm, 'showErrorMessage');
    await wrapper.vm.loadData();
    expect(spyNotification).toHaveBeenCalledWith(error, 'governance.directReports.errorGettingDirectReports');
  });

  it('adjusting search input adjusts search query', async () => {
    wrapper.setData({ searchQuery: 'test' });
    await wrapper.vm.searchDirectReports();
    expect(GovernanceEnduserApi.getDirectReports).toBeCalledWith('testId', {
      pageNumber: 1, pageSize: 10, sortBy: 'userName', sortDir: 'asc', queryString: 'test',
    });
  });

  it('Sets empty state on inability to load users', async () => {
    GovernanceEnduserApi.getDirectReports = jest.fn().mockReturnValue(Promise.resolve({ data: { result: [], totalCount: 0 } }));
    await wrapper.vm.loadData();
    wrapper.vm.checkIfNoResultsFirstLoad();
    const noResultsOnFirstLoadDirectReports = findByTestId(wrapper, 'no-results-firstload-directreports');
    expect(noResultsOnFirstLoadDirectReports.exists()).toBeTruthy();
    const noResultsOnFirstLoadSearchInput = findByTestId(wrapper, 'search-container-directreports');
    expect(noResultsOnFirstLoadSearchInput.exists()).toBeFalsy();
  });

  it('should calls router push to DirectReportDetail on row click', () => {
    const task = {
      _id: 'id',
      _rev: 'test',
      mail: 'test@forgerock.com',
      profileImage: null,
      givenName: 'test',
      accountStatus: 'active',
      sn: 'test',
      userName: 'test@forgerock.com',
      _refResourceCollection: 'managed/alpha_user',
      _refResourceId: 'id',
    };
    wrapper.vm.viewDirectReportDetails(task);
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
      name: 'DirectReportDetail',
      params: {
        grantType: 'account',
        userId: 'id',
      },
    });
  });

  it('should have a loading spinner & a table', async () => {
    await wrapper.setData({
      isLoading: false,
      items: mockResultItems,
    });
    const directReportsTable = findByTestId(wrapper, 'table-directreports');
    expect(directReportsTable.exists()).toBeTruthy();
    expect(directReportsTable.findAll('tr').at(1).text()).toContain(mockResultItems[0].userName);
    directReportsTable.findAll('tr').at(1).trigger('click');
    await wrapper.vm.$nextTick();
    expect(mockRouter.push).toHaveBeenCalledWith({
      name: 'DirectReportDetail',
      params: {
        grantType: 'account',
        userId: 'aa75d444-379e-491c-8971-f1b85e533c56',
      },
    });
  });
});
