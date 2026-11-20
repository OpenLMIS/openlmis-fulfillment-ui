/*
 * This program is part of the OpenLMIS logistics management information system platform software.
 * Copyright © 2017 VillageReach
 *
 * This program is free software: you can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License as published by the Free Software Foundation, either
 * version 3 of the License, or (at your option) any later version.
 *  
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
 * See the GNU Affero General Public License for more details. You should have received a copy of
 * the GNU Affero General Public License along with this program. If not, see
 * http://www.gnu.org/licenses.  For additional information contact info@OpenLMIS.org. 
 */

describe('openlmis.stockmanagement.transfers state', function() {

    beforeEach(function() {
        module('transfer-overview', function($provide) {
            $provide.value('featureFlagService', {
                set: function() {},
                get: function() {}
            });
        });

        inject(function($injector) {
            this.$q = $injector.get('$q');
            this.$state = $injector.get('$state');
            this.$rootScope = $injector.get('$rootScope');
            this.ADMINISTRATION_RIGHTS = $injector.get('ADMINISTRATION_RIGHTS');
            this.FULFILLMENT_RIGHTS = $injector.get('FULFILLMENT_RIGHTS');
            this.SHOW_TRANSFERS = $injector.get('SHOW_TRANSFERS');
            this.TRANSFER_OVERVIEW = $injector.get('TRANSFER_OVERVIEW');
            this.programService = $injector.get('programService');
            this.facilityFactory = $injector.get('facilityFactory');
            this.paginationService = $injector.get('paginationService');
            this.transferOverviewService = $injector.get('transferOverviewService');
        });

        this.state = this.$state.get('openlmis.stockmanagement.transfers');
        this.user = {
            //eslint-disable-next-line camelcase
            user_id: 'user-id'
        };
        this.facility = {
            id: 'home-id',
            supportedPrograms: [{
                id: 'program-a',
                supportActive: true
            }, {
                id: 'program-b',
                supportActive: false
            }]
        };

        this.resolve = function(promise) {
            var result;
            promise.then(function(value) {
                result = value;
            });
            this.$rootScope.$apply();
            return result;
        };
    });

    it('should keep the tab and the filters in the url', function() {
        expect(this.state.url).toEqual('/transfers?tab&programId&type&status&partnerId&page&size');
    });

    it('should require ORDER_CREATE or SHIPMENTS_EDIT', function() {
        expect(this.state.accessRights).toEqual([
            this.ADMINISTRATION_RIGHTS.ORDER_CREATE,
            this.FULFILLMENT_RIGHTS.SHIPMENTS_EDIT
        ]);

        expect(this.state.areAllRightsRequired).toBe(false);
    });

    it('should be shown in navigation only when transfers are enabled', function() {
        expect(this.state.showInNavigation).toBe(this.SHOW_TRANSFERS);
    });

    it('should be listed right below Receive in the menu', function() {
        expect(this.state.priority).toEqual(35);
    });

    it('should not be available offline', function() {
        expect(this.state.isOffline).toBe(false);
    });

    it('should resolve no home facility when the user has none', function() {
        spyOn(this.facilityFactory, 'getUserHomeFacility').andReturn(this.$q.reject());

        expect(this.resolve(this.state.resolve.facility(this.facilityFactory))).toBeUndefined();
    });

    describe('rights', function() {

        it('should check the rights at the home facility', function() {
            var rights = {
                canRequest: true
            };
            spyOn(this.transferOverviewService, 'getRights').andReturn(this.$q.resolve(rights));

            var result = this.resolve(this.state.resolve.rights(this.user, this.facility,
                this.transferOverviewService));

            expect(result).toBe(rights);
            expect(this.transferOverviewService.getRights).toHaveBeenCalledWith('user-id', 'home-id');
        });

        it('should give no rights without a home facility', function() {
            expect(this.state.resolve.rights(this.user, undefined, this.transferOverviewService)).toEqual({
                podManagePrograms: []
            });
        });
    });

    describe('tab', function() {

        it('should open the tab in the url', function() {
            expect(this.state.resolve.tab({
                tab: 'outgoing'
            }, {
                canRequest: true
            }, this.TRANSFER_OVERVIEW)).toEqual('outgoing');
        });

        it('should open incoming stock by default', function() {
            expect(this.state.resolve.tab({}, {
                canRequest: true,
                canFulfil: true
            }, this.TRANSFER_OVERVIEW)).toEqual('incoming');
        });

        it('should open outgoing stock by default for a user who can only fulfil', function() {
            expect(this.state.resolve.tab({
                tab: 'unknown'
            }, {
                canFulfil: true
            }, this.TRANSFER_OVERVIEW)).toEqual('outgoing');
        });
    });

    it('should resolve the user programs the home facility supports', function() {
        spyOn(this.programService, 'getUserPrograms').andReturn(this.$q.resolve([{
            id: 'program-a'
        }, {
            id: 'program-b'
        }, {
            id: 'program-c'
        }]));

        var result = this.resolve(this.state.resolve.programs(this.user, this.facility, this.programService));

        expect(result).toEqual([{
            id: 'program-a'
        }]);

        expect(this.programService.getUserPrograms).toHaveBeenCalledWith('user-id');
    });

    describe('partners', function() {

        beforeEach(function() {
            this.rights = {
                canRequest: true
            };
            this.programs = [{
                id: 'program-a'
            }, {
                id: 'program-c'
            }];
            spyOn(this.transferOverviewService, 'getPartners').andReturn(this.$q.resolve([]));
        });

        it('should get the partners in every program', function() {
            this.state.resolve.partners({}, this.facility, this.programs, 'incoming', this.rights,
                this.transferOverviewService);

            expect(this.transferOverviewService.getPartners)
                .toHaveBeenCalledWith('home-id', ['program-a', 'program-c'], 'incoming', this.rights);
        });

        it('should get the partners in the selected program', function() {
            this.state.resolve.partners({
                programId: 'program-c'
            }, this.facility, this.programs, 'outgoing', this.rights, this.transferOverviewService);

            expect(this.transferOverviewService.getPartners)
                .toHaveBeenCalledWith('home-id', ['program-c'], 'outgoing', this.rights);
        });
    });

    describe('orders', function() {

        beforeEach(function() {
            spyOn(this.paginationService, 'registerUrl').andCallFake(function(stateParams, loadItems) {
                return loadItems(stateParams);
            });
        });

        it('should search the transfers of the home facility on the tab', function() {
            var page = {
                content: []
            };
            spyOn(this.transferOverviewService, 'search').andReturn(page);

            var stateParams = {
                programId: 'program-a'
            };

            expect(this.state.resolve.orders(stateParams, this.facility, 'incoming', this.paginationService,
                this.transferOverviewService)).toBe(page);

            expect(this.transferOverviewService.search).toHaveBeenCalledWith('home-id', 'incoming', stateParams);
        });

        it('should not search without a home facility', function() {
            spyOn(this.transferOverviewService, 'search');

            this.state.resolve.orders({}, undefined, 'incoming', this.paginationService,
                this.transferOverviewService);

            expect(this.transferOverviewService.search).not.toHaveBeenCalled();
        });
    });

    describe('counts', function() {

        it('should count the current tab from the page and the other one without the partner', function() {
            spyOn(this.paginationService, 'getTotalItems').andReturn(4);
            spyOn(this.transferOverviewService, 'count').andReturn(this.$q.resolve(9));

            var result = this.resolve(this.state.resolve.counts({
                programId: 'program-a',
                partnerId: 'wh-1'
            }, this.facility, 'incoming', [], this.paginationService, this.transferOverviewService,
            this.TRANSFER_OVERVIEW));

            expect(result).toEqual({
                incoming: 4,
                outgoing: 9
            });

            expect(this.transferOverviewService.count).toHaveBeenCalledWith('home-id', 'outgoing', {
                programId: 'program-a',
                partnerId: undefined
            });
        });

        it('should leave out the other count when it cannot be loaded', function() {
            spyOn(this.paginationService, 'getTotalItems').andReturn(2);
            spyOn(this.transferOverviewService, 'count').andReturn(this.$q.reject());

            var result = this.resolve(this.state.resolve.counts({}, this.facility, 'outgoing', [],
                this.paginationService, this.transferOverviewService, this.TRANSFER_OVERVIEW));

            expect(result).toEqual({
                outgoing: 2
            });
        });
    });
});
