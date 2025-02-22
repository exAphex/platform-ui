/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, createWrapper } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as GovernanceEnduserApi from '@/api/GovernanceEnduserApi';
import Delegates from './index';

jest.mock('@/api/GovernanceEnduserApi');

describe('AccessReviews', () => {
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();
    GovernanceEnduserApi.getTaskProxies = jest.fn().mockReturnValue(Promise.resolve({
      data: {
        result: [
          {
            user: 'testUser',
            start: 'testStart',
            end: 'testEnd',
          },
        ],
      },
    }));
    GovernanceEnduserApi.deleteTaskProxy = jest.fn().mockReturnValue(Promise.resolve({ data: { result: [] } }));
    wrapper = mount(Delegates, {
      mocks: {
        $t: (t) => t,
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

  it('should have a table', () => {
    const delegateTable = findByTestId(wrapper, 'delegate-table');
    expect(delegateTable.exists()).toBeTruthy();
  });

  it('should have a button to add delegates', async () => {
    const rootWrapper = createWrapper(wrapper.vm.$root);
    const addDelegate = findByTestId(wrapper, 'add-delegate');
    expect(addDelegate.exists()).toBeTruthy();

    await addDelegate.trigger('click');
    expect(rootWrapper.emitted('bv::show::modal')[0]).toEqual(['add-delegate-modal']);
  });

  it('should have an input to search delegates', () => {
    const searchDelegate = findByTestId(wrapper, 'search-delegate');
    expect(searchDelegate.exists()).toBeTruthy();
  });

  it('clearing the search input resets the query params', async () => {
    const clearSpy = jest.spyOn(wrapper.vm, 'clear');
    const loadSpy = jest.spyOn(wrapper.vm, 'loadData');
    const searchDelegate = findByTestId(wrapper, 'search-delegate');
    await searchDelegate.vm.$emit('input', 'test');
    await searchDelegate.vm.$emit('clear');

    expect(clearSpy).toHaveBeenCalled();
    expect(wrapper.vm.searchQuery).toBe('');
    expect(wrapper.vm.paginationPage).toBe(1);
    expect(loadSpy).toHaveBeenCalled();
  });

  it('clicking delete should open delete modal', async () => {
    const rootWrapper = createWrapper(wrapper.vm.$root);
    wrapper.vm.items = [{
      user: 'testUser',
      start: 'today',
      end: 'tomorrow',
    }];
    const deleteButton = findByTestId(wrapper, 'remove-delegate');

    await deleteButton.trigger('click');
    expect(rootWrapper.emitted('bv::show::modal')[0]).toEqual(['delegate-delete-modal']);
  });

  it('can sort table by descending', () => {
    const loadSpy = jest.spyOn(wrapper.vm, 'loadData');
    wrapper.vm.sortChanged({ sortDesc: true });

    expect(wrapper.vm.sortDesc).toBeTruthy();
    expect(loadSpy).toBeCalled();
  });

  it('can sort table by ascending', () => {
    const loadSpy = jest.spyOn(wrapper.vm, 'loadData');
    wrapper.vm.sortChanged({ sortDesc: false });

    expect(wrapper.vm.sortDesc).toBeFalsy();
    expect(loadSpy).toBeCalled();
  });

  it('can set page size', () => {
    const loadSpy = jest.spyOn(wrapper.vm, 'loadData');
    wrapper.vm.pageSizeChange(20);

    expect(wrapper.vm.paginationPageSize).toBe(20);
    expect(loadSpy).toBeCalled();
  });

  it('can set page', () => {
    const loadSpy = jest.spyOn(wrapper.vm, 'loadData');
    wrapper.vm.pageChange(2);

    expect(wrapper.vm.paginationPage).toBe(2);
    expect(loadSpy).toBeCalled();
  });

  describe('loadData()', () => {
    it('gets task proxies based on page size', () => {
      const getTaskProxies = jest.spyOn(GovernanceEnduserApi, 'getTaskProxies');
      wrapper.vm.paginationPageSize = 20;
      wrapper.vm.loadData();
      expect(getTaskProxies).toBeCalledWith('testId', {
        pageNumber: 1,
        pageSize: 20,
      });
    });

    it('gets task proxies based on page number', () => {
      const getTaskProxies = jest.spyOn(GovernanceEnduserApi, 'getTaskProxies');
      wrapper.vm.paginationPage = 2;
      wrapper.vm.loadData();
      expect(getTaskProxies).toBeCalledWith('testId', {
        pageNumber: 2,
        pageSize: 10,
      });
    });

    it('gets task proxies for a given user', () => {
      const getTaskProxies = jest.spyOn(GovernanceEnduserApi, 'getTaskProxies');
      wrapper.vm.loadData();
      expect(getTaskProxies).toBeCalledWith('testId', {
        pageNumber: 1,
        pageSize: 10,
      });
    });

    it('gets task proxies sorted by userName', () => {
      const getTaskProxies = jest.spyOn(GovernanceEnduserApi, 'getTaskProxies');
      wrapper.vm.sortDesc = true;
      wrapper.vm.loadData();
      expect(getTaskProxies).toBeCalledWith('testId', {
        pageNumber: 1,
        pageSize: 10,
        sortBy: 'userName',
        sortDir: 'desc',
      });

      wrapper.vm.sortDesc = false;
      wrapper.vm.loadData();
      expect(getTaskProxies).toBeCalledWith('testId', {
        pageNumber: 1,
        pageSize: 10,
        sortBy: 'userName',
        sortDir: 'asc',
      });
    });

    it('gets task proxies that match a query string', () => {
      const getTaskProxies = jest.spyOn(GovernanceEnduserApi, 'getTaskProxies');
      wrapper.vm.searchQuery = 'testSearch';
      wrapper.vm.loadData();
      expect(getTaskProxies).toBeCalledWith('testId', {
        pageNumber: 1,
        pageSize: 10,
        queryString: 'testSearch',
      });
    });

    it('sets table items when data is successfully loaded', async () => {
      const delgates = [
        {
          userName: 'testUser1',
          givenName: 'test',
          sn: 'user',
        },
        {
          userName: 'testUser2',
          givenName: 'test',
          sn: 'user',
        },
      ];
      jest.spyOn(GovernanceEnduserApi, 'getTaskProxies').mockResolvedValue({
        data: { result: delgates },
      });

      wrapper.vm.loadData();
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.items[0].userName).toBe('testUser1');
      expect(wrapper.vm.items[1].userName).toBe('testUser2');
    });

    it('displays an error notifcation if loading fails', async () => {
      jest.spyOn(GovernanceEnduserApi, 'getTaskProxies').mockRejectedValue('test');
      const errorSpy = jest.spyOn(wrapper.vm, 'showErrorMessage');

      wrapper.vm.loadData();
      await wrapper.vm.$nextTick();

      expect(errorSpy).toHaveBeenCalled();
    });

    it('displays noData component when no task proxies are found', async () => {
      jest.spyOn(GovernanceEnduserApi, 'getTaskProxies').mockResolvedValue({
        data: { result: [] },
      });

      wrapper.vm.loadData();
      await wrapper.vm.$nextTick();

      const noData = findByTestId(wrapper, 'delegates-no-data');
      expect(noData.exists()).toBeTruthy();
    });
  });

  describe('removeDelegate', () => {
    it('calls to remove a task proxy from a user', () => {
      const deleteTaskProxy = jest.spyOn(GovernanceEnduserApi, 'deleteTaskProxy');
      wrapper.vm.selectedDelegate = {
        _refResourceId: 'removeId',
      };
      wrapper.vm.removeDelegate();
      expect(deleteTaskProxy).toBeCalledWith(
        'testId',
        ['managed/user/removeId'],
      );
    });

    it('calls loadData after deleting user', async () => {
      const loadData = jest.spyOn(wrapper.vm, 'loadData');
      wrapper.vm.removeDelegate();
      await flushPromises();
      expect(loadData).toHaveBeenCalled();
    });
  });

  describe('dates', () => {
    const duration = [
      { duration: '2023-02-10T18:13:49+00:00/2023-02-15T18:13:49+00:00' },
    ];
    it('start date is calculated properly', () => {
      const date = wrapper.vm.getStartDate(duration);
      expect(date).toBe('common.months.february 10, 2023');
    });

    it('no start date returns -', () => {
      const date = wrapper.vm.getStartDate();
      expect(date).toBe('-');
    });

    it('end date is calculated properly', () => {
      const date = wrapper.vm.getEndDate(duration);
      expect(date).toBe('common.months.february 15, 2023');
    });

    it('no end date returns -', () => {
      const date = wrapper.vm.getEndDate();
      expect(date).toBe('-');
    });
  });
});
