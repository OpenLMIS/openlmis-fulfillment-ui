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

describe('TransferOverviewController', function() {

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
            this.$controller = $injector.get('$controller');
            this.$state = $injector.get('$state');
            this.notificationService = $injector.get('notificationService');
            this.loadingModalService = $injector.get('loadingModalService');
            this.proofOfDeliveryManageService = $injector.get('proofOfDeliveryManageService');
        });

        this.allRights = {
            canRequest: true,
            canFulfil: true,
            canViewShipments: true,
            canViewPods: true,
            podManagePrograms: ['program-a']
        };

        this.order = function(type, status, programId) {
            return {
                id: 'order-' + type + '-' + status,
                type: type,
                status: status,
                program: {
                    id: programId || 'program-a'
                }
            };
        };

        this.init = function(options) {
            options = options || {};
            this.vm = this.$controller('TransferOverviewController', {
                $stateParams: options.stateParams || {},
                facility: {
                    id: 'home-id'
                },
                rights: options.rights || this.allRights,
                tab: options.tab || 'incoming',
                programs: [{
                    id: 'program-a'
                }],
                partners: [{
                    id: 'wh-1'
                }],
                orders: options.orders || [],
                counts: {
                    incoming: 1,
                    outgoing: 2
                }
            });
            this.vm.$onInit();
        };

        this.actionOf = function(order, options) {
            this.init(angular.extend({
                orders: [order]
            }, options));
            return this.vm.orders[0].$action;
        };

        spyOn(this.$state, 'go');
        spyOn(this.loadingModalService, 'open');
        spyOn(this.loadingModalService, 'close');
        spyOn(this.notificationService, 'error');
    });

    describe('$onInit', function() {

        it('should set the filters from the url', function() {
            this.init({
                stateParams: {
                    programId: 'program-a',
                    partnerId: 'wh-1',
                    type: 'TRANSFER_PUSH',
                    status: 'RECEIVED'
                }
            });

            expect(this.vm.program).toEqual({
                id: 'program-a'
            });

            expect(this.vm.partner).toEqual({
                id: 'wh-1'
            });

            expect(this.vm.type).toEqual('TRANSFER_PUSH');
            expect(this.vm.status).toEqual('RECEIVED');
            expect(this.vm.counts).toEqual({
                incoming: 1,
                outgoing: 2
            });
        });

        it('should show open transfers by default', function() {
            this.init();

            expect(this.vm.status).toEqual('OPEN');
        });

        it('should show open transfers when the draft status is set on the outgoing tab', function() {
            this.init({
                tab: 'outgoing',
                stateParams: {
                    status: 'CREATING'
                }
            });

            expect(this.vm.status).toEqual('OPEN');
        });

        it('should offer the draft status only on the incoming tab', function() {
            this.init();

            expect(statusValues(this.vm)).toEqual(['OPEN', 'ALL', 'CREATING', 'ORDERED', 'FULFILLING', 'SHIPPED',
                'RECEIVED', 'CANCELLED']);

            this.init({
                tab: 'outgoing'
            });

            expect(statusValues(this.vm)).toEqual(['OPEN', 'ALL', 'ORDERED', 'FULFILLING', 'SHIPPED', 'RECEIVED',
                'CANCELLED']);
        });
    });

    describe('incoming actions', function() {

        it('should edit a draft request', function() {
            expect(this.actionOf(this.order('TRANSFER_REQUEST', 'CREATING'))).toEqual({
                label: 'transferOverview.edit',
                kind: 'primary',
                state: 'openlmis.stockmanagement.transferRequest.table',
                params: {
                    programId: 'program-a',
                    orderId: 'order-TRANSFER_REQUEST-CREATING'
                }
            });
        });

        it('should not edit a draft request without ORDER_CREATE', function() {
            expect(this.actionOf(this.order('TRANSFER_REQUEST', 'CREATING'), {
                rights: {
                    canViewPods: true,
                    podManagePrograms: []
                }
            })).toBeUndefined();
        });

        it('should wait for the supplier of a sent request', function() {
            expect(this.actionOf(this.order('TRANSFER_REQUEST', 'ORDERED')).kind).toEqual('text');
            expect(this.actionOf(this.order('TRANSFER_REQUEST', 'FULFILLING')).label)
                .toEqual('transferOverview.waitingForSupplier');
        });

        it('should receive shipped stock with PODS_MANAGE for its program', function() {
            expect(this.actionOf(this.order('TRANSFER_PUSH', 'SHIPPED'))).toEqual({
                label: 'transferOverview.receive',
                kind: 'primary',
                pod: true
            });
        });

        it('should only view shipped stock of a program without PODS_MANAGE', function() {
            expect(this.actionOf(this.order('TRANSFER_REQUEST', 'SHIPPED', 'program-b')).label)
                .toEqual('transferOverview.view');
        });

        it('should view received stock with a proof of delivery right', function() {
            expect(this.actionOf(this.order('TRANSFER_REQUEST', 'RECEIVED'))).toEqual({
                label: 'transferOverview.view',
                kind: 'secondary',
                pod: true
            });
        });

        it('should show nothing for received stock without a proof of delivery right', function() {
            expect(this.actionOf(this.order('TRANSFER_PUSH', 'RECEIVED'), {
                rights: {
                    podManagePrograms: []
                }
            })).toBeUndefined();
        });
    });

    describe('outgoing actions', function() {

        it('should fulfil an ordered request', function() {
            expect(this.actionOf(this.order('TRANSFER_REQUEST', 'ORDERED'), {
                tab: 'outgoing'
            })).toEqual({
                label: 'transferOverview.fulfil',
                kind: 'primary',
                state: 'openlmis.orders.shipmentView',
                params: {
                    id: 'order-TRANSFER_REQUEST-ORDERED'
                }
            });
        });

        it('should continue fulfilling a request', function() {
            expect(this.actionOf(this.order('TRANSFER_REQUEST', 'FULFILLING'), {
                tab: 'outgoing'
            }).label).toEqual('transferOverview.continueFulfilment');
        });

        it('should not fulfil without SHIPMENTS_EDIT', function() {
            expect(this.actionOf(this.order('TRANSFER_REQUEST', 'ORDERED'), {
                tab: 'outgoing',
                rights: {
                    canViewShipments: true,
                    podManagePrograms: []
                }
            })).toBeUndefined();
        });

        it('should view the shipment of shipped and received transfers', function() {
            expect(this.actionOf(this.order('TRANSFER_PUSH', 'SHIPPED'), {
                tab: 'outgoing'
            }).label).toEqual('transferOverview.viewShipment');

            expect(this.actionOf(this.order('TRANSFER_REQUEST', 'RECEIVED'), {
                tab: 'outgoing'
            }).kind).toEqual('secondary');
        });

        it('should not view the shipment without a shipment right', function() {
            expect(this.actionOf(this.order('TRANSFER_PUSH', 'SHIPPED'), {
                tab: 'outgoing',
                rights: {
                    podManagePrograms: []
                }
            })).toBeUndefined();
        });
    });

    describe('search', function() {

        it('should reload the page with the filters from the first page', function() {
            this.init({
                stateParams: {
                    page: 3,
                    size: 10
                }
            });
            this.vm.program = {
                id: 'program-a'
            };
            this.vm.partner = {
                id: 'wh-1'
            };
            this.vm.type = 'TRANSFER_REQUEST';
            this.vm.status = 'ALL';

            this.vm.search();

            expect(this.$state.go).toHaveBeenCalledWith('openlmis.stockmanagement.transfers', {
                tab: 'incoming',
                programId: 'program-a',
                partnerId: 'wh-1',
                type: 'TRANSFER_REQUEST',
                status: 'ALL',
                page: 0,
                size: 10
            }, {
                reload: true
            });
        });

        it('should show all statuses when the status is cleared', function() {
            this.init();
            this.vm.status = undefined;

            this.vm.search();

            expect(this.$state.go.calls[0].args[1].status).toEqual('ALL');
        });

        it('should leave the open status out of the url', function() {
            this.init();

            this.vm.search();

            expect(this.$state.go.calls[0].args[1].status).toBeUndefined();
        });
    });

    describe('getTabParams', function() {

        it('should keep the filters but the partner', function() {
            this.init({
                stateParams: {
                    programId: 'program-a',
                    type: 'TRANSFER_PUSH',
                    status: 'ALL',
                    partnerId: 'wh-1',
                    page: 2,
                    size: 10
                }
            });

            expect(this.vm.getTabParams('outgoing')).toEqual({
                tab: 'outgoing',
                programId: 'program-a',
                type: 'TRANSFER_PUSH',
                status: 'ALL',
                partnerId: undefined,
                page: 0,
                size: 10
            });
        });

        it('should clear the draft status when opening the outgoing tab', function() {
            this.init({
                stateParams: {
                    status: 'CREATING'
                }
            });

            expect(this.vm.getTabParams('outgoing').status).toBeUndefined();
            expect(this.vm.getTabParams('incoming').status).toEqual('CREATING');
        });
    });

    describe('perform', function() {

        it('should open the state of the action', function() {
            this.init({
                orders: [this.order('TRANSFER_REQUEST', 'CREATING')]
            });

            this.vm.perform(this.vm.orders[0]);

            expect(this.$state.go).toHaveBeenCalledWith('openlmis.stockmanagement.transferRequest.table', {
                programId: 'program-a',
                orderId: 'order-TRANSFER_REQUEST-CREATING'
            });
        });

        it('should open the proof of delivery of the order', function() {
            spyOn(this.proofOfDeliveryManageService, 'getByOrderId').andReturn(this.$q.resolve({
                id: 'pod-id'
            }));
            this.init({
                orders: [this.order('TRANSFER_PUSH', 'SHIPPED')]
            });

            this.vm.perform(this.vm.orders[0]);
            this.$rootScope.$apply();

            expect(this.loadingModalService.open).toHaveBeenCalled();
            expect(this.proofOfDeliveryManageService.getByOrderId).toHaveBeenCalledWith('order-TRANSFER_PUSH-SHIPPED');
            expect(this.$state.go).toHaveBeenCalledWith('openlmis.orders.podManage.podView', {
                podId: 'pod-id'
            });
        });

        it('should tell the user when the proof of delivery cannot be found', function() {
            spyOn(this.proofOfDeliveryManageService, 'getByOrderId').andReturn(this.$q.reject());
            this.init({
                orders: [this.order('TRANSFER_PUSH', 'SHIPPED')]
            });

            this.vm.perform(this.vm.orders[0]);
            this.$rootScope.$apply();

            expect(this.notificationService.error).toHaveBeenCalledWith('transferOverview.podNotFound');
            expect(this.loadingModalService.close).toHaveBeenCalled();
            expect(this.$state.go).not.toHaveBeenCalled();
        });
    });

    function statusValues(vm) {
        return vm.statuses.map(function(status) {
            return status.value;
        });
    }
});
