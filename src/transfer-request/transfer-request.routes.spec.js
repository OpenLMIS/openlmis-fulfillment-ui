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

describe('openlmis.stockmanagement.transferRequest state', function() {

    beforeEach(function() {
        module('transfer-request', function($provide) {
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
            this.SHOW_TRANSFERS = $injector.get('SHOW_TRANSFERS');
            this.ORDER_TYPE = $injector.get('ORDER_TYPE');
            this.transferService = $injector.get('transferService');
            this.programService = $injector.get('programService');
            this.facilityFactory = $injector.get('facilityFactory');
            this.orderService = $injector.get('orderService');
            this.notificationService = $injector.get('notificationService');
        });

        this.state = this.$state.get('openlmis.stockmanagement.transferRequest');
        this.tableState = this.$state.get('openlmis.stockmanagement.transferRequest.table');
        this.facility = {
            id: 'facility-id',
            supportedPrograms: [{
                id: 'supported-id',
                supportActive: true
            }, {
                id: 'inactive-id',
                supportActive: false
            }]
        };

        this.resolve = function(promise) {
            var result = {};
            promise
                .then(function(response) {
                    result.value = response;
                })
                .catch(function() {
                    result.rejected = true;
                });
            this.$rootScope.$apply();
            return result;
        };
    });

    it('should keep the program in the url', function() {
        expect(this.state.url).toEqual('/transferRequest?programId');
    });

    it('should require ORDER_CREATE right', function() {
        expect(this.state.accessRights).toEqual([this.ADMINISTRATION_RIGHTS.ORDER_CREATE]);
        expect(this.tableState.accessRights).toEqual([this.ADMINISTRATION_RIGHTS.ORDER_CREATE]);
    });

    it('should be shown in navigation only when transfers are enabled', function() {
        expect(this.state.showInNavigation).toBe(this.SHOW_TRANSFERS);
    });

    it('should not be available offline', function() {
        expect(this.state.isOffline).toBe(false);
        expect(this.tableState.isOffline).toBe(false);
    });

    it('should show the request form and the request table', function() {
        expect(this.state.views['@openlmis'].controller).toEqual('TransferRequestController');
        expect(this.state.views['@openlmis'].templateUrl).toEqual('transfer-request/transfer-request.html');
        expect(this.tableState.url).toEqual('/:orderId');
        expect(this.tableState.views['@openlmis'].controller).toEqual('TransferRequestTableController');
        expect(this.tableState.views['@openlmis'].templateUrl)
            .toEqual('transfer-request/transfer-request-table.html');
    });

    describe('facility', function() {

        it('should resolve the home facility of the user', function() {
            spyOn(this.facilityFactory, 'getUserHomeFacility').andReturn(this.$q.resolve(this.facility));

            expect(this.resolve(this.state.resolve.facility(this.facilityFactory)).value).toBe(this.facility);
        });

        it('should resolve no facility when the user has no home facility', function() {
            spyOn(this.facilityFactory, 'getUserHomeFacility').andReturn(this.$q.reject());

            var result = this.resolve(this.state.resolve.facility(this.facilityFactory));

            expect(result.rejected).toBeUndefined();
            expect(result.value).toBeUndefined();
        });
    });

    describe('programs', function() {

        it('should resolve only the user programs the home facility actively supports', function() {
            spyOn(this.programService, 'getUserPrograms').andReturn(this.$q.resolve([{
                id: 'supported-id'
            }, {
                id: 'inactive-id'
            }, {
                id: 'unsupported-id'
            }]));

            var result = this.resolve(this.$q.when(this.state.resolve.programs({
                //eslint-disable-next-line camelcase
                user_id: 'user-id'
            }, this.facility, this.programService)));

            expect(result.value).toEqual([{
                id: 'supported-id'
            }]);

            expect(this.programService.getUserPrograms).toHaveBeenCalledWith('user-id');
        });

        it('should resolve no programs without a home facility', function() {
            spyOn(this.programService, 'getUserPrograms');

            expect(this.state.resolve.programs({}, undefined, this.programService)).toEqual([]);
            expect(this.programService.getUserPrograms).not.toHaveBeenCalled();
        });
    });

    describe('partners', function() {

        beforeEach(function() {
            spyOn(this.transferService, 'getPartners').andReturn(this.$q.resolve([]));
        });

        it('should resolve the facilities the home facility may request from', function() {
            this.state.resolve.partners({
                programId: 'program-id'
            }, this.facility, this.transferService);

            expect(this.transferService.getPartners).toHaveBeenCalledWith('facility-id', 'program-id', 'REQUEST');
        });

        it('should resolve no partners without a program', function() {
            expect(this.state.resolve.partners({}, this.facility, this.transferService)).toEqual([]);
            expect(this.transferService.getPartners).not.toHaveBeenCalled();
        });

        it('should resolve no partners without a home facility', function() {
            expect(this.state.resolve.partners({
                programId: 'program-id'
            }, undefined, this.transferService)).toEqual([]);

            expect(this.transferService.getPartners).not.toHaveBeenCalled();
        });
    });

    describe('order', function() {

        beforeEach(function() {
            spyOn(this.$state, 'go');
            spyOn(this.notificationService, 'error');

            this.stateParams = {
                orderId: 'order-id',
                programId: 'program-id'
            };

            this.resolveOrder = function(response) {
                spyOn(this.orderService, 'get').andReturn(response);
                return this.resolve(this.tableState.resolve.order(this.$q, this.$state, this.stateParams,
                    this.orderService, this.notificationService, this.ORDER_TYPE));
            };
        });

        it('should resolve a transfer request that was not sent yet', function() {
            var order = {
                id: 'order-id',
                type: 'TRANSFER_REQUEST',
                status: 'CREATING'
            };

            var result = this.resolveOrder(this.$q.resolve(order));

            expect(result.value).toBe(order);
            expect(this.orderService.get).toHaveBeenCalledWith('order-id');
            expect(this.$state.go).not.toHaveBeenCalled();
        });

        it('should return to the form when the request was already sent', function() {
            var result = this.resolveOrder(this.$q.resolve({
                type: 'TRANSFER_REQUEST',
                status: 'ORDERED'
            }));

            expect(result.rejected).toBe(true);
            expect(this.notificationService.error).toHaveBeenCalledWith('transferRequest.notEditable');
            expect(this.$state.go).toHaveBeenCalledWith('openlmis.stockmanagement.transferRequest', {
                programId: 'program-id'
            });
        });

        it('should return to the form when the order is not a transfer request', function() {
            var result = this.resolveOrder(this.$q.resolve({
                type: 'REQUISITION_LESS',
                status: 'CREATING'
            }));

            expect(result.rejected).toBe(true);
            expect(this.notificationService.error).toHaveBeenCalledWith('transferRequest.notEditable');
        });

        it('should return to the form when the request cannot be read', function() {
            var result = this.resolveOrder(this.$q.reject({
                status: 403
            }));

            expect(result.rejected).toBe(true);
            expect(this.notificationService.error).not.toHaveBeenCalled();
            expect(this.$state.go).toHaveBeenCalledWith('openlmis.stockmanagement.transferRequest', {
                programId: 'program-id'
            });
        });
    });

    describe('stockCardSummaries', function() {

        it('should resolve the stock of the requesting facility in the program', function() {
            var query = jasmine.createSpy('query').andReturn(this.$q.resolve({
                content: ['summary']
            }));
            var StockCardSummaryRepositoryImpl = function() {
                this.query = query;
            };

            var result = this.resolve(this.tableState.resolve.stockCardSummaries({
                program: {
                    id: 'program-id'
                },
                requestingFacility: {
                    id: 'facility-id'
                }
            }, StockCardSummaryRepositoryImpl));

            expect(result.value).toEqual(['summary']);
            expect(query).toHaveBeenCalledWith({
                programId: 'program-id',
                facilityId: 'facility-id'
            });
        });
    });
});
