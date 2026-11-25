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

describe('transferOverviewService', function() {

    beforeEach(function() {
        module('transfer-overview', function($provide) {
            $provide.value('featureFlagService', {
                set: function() {},
                get: function() {}
            });
        });

        inject(function($injector) {
            this.$q = $injector.get('$q');
            this.$rootScope = $injector.get('$rootScope');
            this.transferOverviewService = $injector.get('transferOverviewService');
            this.orderRepository = $injector.get('orderRepository');
            this.orderService = $injector.get('orderService');
            this.transferService = $injector.get('transferService');
            this.permissionService = $injector.get('permissionService');
        });

        this.resolve = function(promise) {
            var result;
            promise.then(function(value) {
                result = value;
            });
            this.$rootScope.$apply();
            return result;
        };

        this.searchParams = function(filters, tab) {
            spyOn(this.orderRepository, 'search').andReturn(this.$q.resolve({
                content: []
            }));
            this.transferOverviewService.search('home-id', tab || 'incoming', filters);
            return this.orderRepository.search.calls[0].args[0];
        };
    });

    describe('getRights', function() {

        beforeEach(function() {
            spyOn(this.permissionService, 'load').andReturn(this.$q.resolve([
                {
                    right: 'ORDER_CREATE',
                    facilityId: 'home-id',
                    programId: 'program-a'
                },
                {
                    right: 'PODS_MANAGE',
                    facilityId: 'home-id',
                    programId: 'program-a'
                },
                {
                    right: 'PODS_MANAGE',
                    facilityId: 'other-id',
                    programId: 'program-b'
                },
                {
                    right: 'SHIPMENTS_EDIT',
                    facilityId: 'other-id',
                    programId: 'program-a'
                }
            ]));
        });

        it('should check the rights at the home facility only', function() {
            var rights = this.resolve(this.transferOverviewService.getRights('user-id', 'home-id'));

            expect(this.permissionService.load).toHaveBeenCalledWith('user-id');
            expect(rights).toEqual({
                canRequest: true,
                canFulfil: false,
                canViewShipments: false,
                canViewPods: true,
                podManagePrograms: ['program-a']
            });
        });

        it('should give no rights when permissions cannot be loaded', function() {
            this.permissionService.load.andReturn(this.$q.reject());

            var rights = this.resolve(this.transferOverviewService.getRights('user-id', 'home-id'));

            expect(rights).toEqual({
                podManagePrograms: []
            });
        });
    });

    describe('getPartners', function() {

        beforeEach(function() {
            spyOn(this.transferService, 'getPartners').andCallFake(function(facilityId, programId) {
                return {
                    'program-a': this.$q.resolve([{
                        id: 'wh-2',
                        name: 'Warehouse 2'
                    }, {
                        id: 'wh-1',
                        name: 'Warehouse 1'
                    }]),
                    'program-b': this.$q.resolve([{
                        id: 'wh-1',
                        name: 'Warehouse 1'
                    }])
                }[programId];
            }.bind(this));
        });

        it('should get the facilities to request from for incoming stock, each once and sorted', function() {
            var partners = this.resolve(this.transferOverviewService.getPartners('home-id',
                ['program-a', 'program-b'], 'incoming', {
                    canRequest: true
                }));

            expect(this.transferService.getPartners).toHaveBeenCalledWith('home-id', 'program-a', 'REQUEST');
            expect(this.transferService.getPartners).toHaveBeenCalledWith('home-id', 'program-b', 'REQUEST');
            expect(partners).toEqual([{
                id: 'wh-1',
                name: 'Warehouse 1'
            }, {
                id: 'wh-2',
                name: 'Warehouse 2'
            }]);
        });

        it('should get the facilities to send to for outgoing stock', function() {
            this.resolve(this.transferOverviewService.getPartners('home-id', ['program-b'], 'outgoing', {
                canFulfil: true
            }));

            expect(this.transferService.getPartners).toHaveBeenCalledWith('home-id', 'program-b', 'SEND');
        });

        it('should not ask for partners without the right the backend checks', function() {
            var partners = this.resolve(this.transferOverviewService.getPartners('home-id', ['program-a'],
                'outgoing', {
                    canRequest: true
                }));

            expect(this.transferService.getPartners).not.toHaveBeenCalled();
            expect(partners).toEqual([]);
        });
    });

    describe('search', function() {

        it('should search transfers requested by or reallocated to the home facility on the incoming tab', function() {
            var params = this.searchParams({
                page: 1,
                size: 10
            });

            expect(params).toEqual({
                type: ['TRANSFER_REQUEST', 'TRANSFER_PUSH'],
                programId: undefined,
                status: ['CREATING', 'ORDERED', 'FULFILLING', 'SHIPPED', 'TRANSFER_FAILED', 'IN_ROUTE',
                    'READY_TO_PACK'],
                requestingFacilityId: 'home-id',
                supplyingFacilityId: undefined,
                page: 1,
                size: 10,
                sort: 'createdDate,desc'
            });
        });

        it('should search transfers supplied by the home facility, without drafts, on the outgoing tab', function() {
            var params = this.searchParams({
                partnerId: 'hc-1'
            }, 'outgoing');

            expect(params.supplyingFacilityId).toEqual('home-id');
            expect(params.requestingFacilityId).toEqual('hc-1');
            expect(params.status).toEqual(['ORDERED', 'FULFILLING', 'SHIPPED', 'TRANSFER_FAILED', 'IN_ROUTE',
                'READY_TO_PACK']);
        });

        it('should filter by the partner as the supplying facility on the incoming tab', function() {
            expect(this.searchParams({
                partnerId: 'wh-1'
            }).supplyingFacilityId).toEqual('wh-1');
        });

        it('should filter by program and type', function() {
            var params = this.searchParams({
                programId: 'program-a',
                type: 'TRANSFER_PUSH'
            });

            expect(params.programId).toEqual('program-a');
            expect(params.type).toEqual(['TRANSFER_PUSH']);
        });

        it('should not filter by status when all are shown on the incoming tab', function() {
            expect(this.searchParams({
                status: 'ALL'
            }).status).toBeUndefined();
        });

        it('should show every status but drafts when all are shown on the outgoing tab', function() {
            expect(this.searchParams({
                status: 'ALL'
            }, 'outgoing').status).toEqual(['ORDERED', 'FULFILLING', 'SHIPPED', 'RECEIVED', 'TRANSFER_FAILED',
                'IN_ROUTE', 'READY_TO_PACK', 'CANCELLED']);
        });

        it('should filter by the chosen status', function() {
            expect(this.searchParams({
                status: 'RECEIVED'
            }).status).toEqual(['RECEIVED']);
        });

        it('should show open transfers when drafts are chosen on the outgoing tab', function() {
            expect(this.searchParams({
                status: 'CREATING'
            }, 'outgoing').status).toEqual(['ORDERED', 'FULFILLING', 'SHIPPED', 'TRANSFER_FAILED', 'IN_ROUTE',
                'READY_TO_PACK']);
        });
    });

    describe('count', function() {

        it('should count the matching transfers with a one-item page', function() {
            spyOn(this.orderService, 'search').andReturn(this.$q.resolve({
                totalElements: 7
            }));

            var count = this.resolve(this.transferOverviewService.count('home-id', 'outgoing', {
                page: 3,
                size: 20
            }));

            var params = this.orderService.search.calls[0].args[0];

            expect(count).toEqual(7);
            expect(params.supplyingFacilityId).toEqual('home-id');
            expect(params.page).toEqual(0);
            expect(params.size).toEqual(1);
        });
    });
});
