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

describe('TransferRequestTableController', function() {

    beforeEach(function() {
        module('transfer-request', function($provide) {
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
            this.QUANTITY_UNIT = $injector.get('QUANTITY_UNIT');
            this.transferService = $injector.get('transferService');
            this.confirmService = $injector.get('confirmService');
            this.notificationService = $injector.get('notificationService');
            this.loadingModalService = $injector.get('loadingModalService');
        });

        this.orderable = function(id, netContent) {
            return {
                id: id,
                productCode: 'C-' + id,
                fullProductName: 'Product ' + id,
                netContent: netContent,
                meta: {
                    versionNumber: 1
                }
            };
        };

        this.order = {
            id: 'order-id',
            status: 'CREATING',
            program: {
                id: 'program-id',
                name: 'Program'
            },
            requestingFacility: {
                id: 'facility-id'
            },
            supplyingFacility: {
                id: 'partner-id',
                name: 'Partner'
            },
            orderLineItems: [{
                id: 'line-id',
                orderable: this.orderable('saved', 10),
                orderedQuantity: 25
            }]
        };
        this.stockCardSummaries = [{
            orderable: this.orderable('saved', 10),
            stockOnHand: 40
        }, {
            orderable: this.orderable('new', 5),
            stockOnHand: 15
        }];

        spyOn(this.$state, 'go');
        spyOn(this.notificationService, 'success');
        spyOn(this.notificationService, 'info');
        spyOn(this.loadingModalService, 'open');
        spyOn(this.loadingModalService, 'close');
        spyOn(this.confirmService, 'confirm').andReturn(this.$q.resolve());
        spyOn(this.confirmService, 'confirmDestroy').andReturn(this.$q.resolve());

        this.vm = this.$controller('TransferRequestTableController', {
            order: this.order,
            stockCardSummaries: this.stockCardSummaries
        });
        this.vm.$onInit();
    });

    describe('$onInit', function() {

        it('should show the saved lines with their stock on hand and quantity in doses and packs', function() {
            var lineItem = this.vm.lineItems[0];

            expect(lineItem.id).toEqual('line-id');
            expect(lineItem.stockOnHand).toEqual(40);
            expect(lineItem.quantity).toEqual(25);
            expect(lineItem.quantityInPacks).toEqual(2);
            expect(lineItem.quantityRemainderInDoses).toEqual(5);
        });

        it('should show no stock on hand for a product the facility has no stock card for', function() {
            this.order.orderLineItems[0].orderable = this.orderable('unknown', 1);

            this.vm.$onInit();

            expect(this.vm.lineItems[0].stockOnHand).toEqual(0);
        });
    });

    describe('addProduct', function() {

        it('should add the selected product with its stock on hand', function() {
            this.vm.selectedStockCardSummary = this.stockCardSummaries[1];

            this.vm.addProduct();

            expect(this.vm.lineItems.length).toBe(2);
            expect(this.vm.lineItems[1].orderable.id).toEqual('new');
            expect(this.vm.lineItems[1].orderable.meta.versionNumber).toEqual(1);
            expect(this.vm.lineItems[1].stockOnHand).toEqual(15);
        });

        it('should not add a product twice', function() {
            this.vm.selectedStockCardSummary = this.stockCardSummaries[0];

            this.vm.addProduct();

            expect(this.vm.lineItems.length).toBe(1);
            expect(this.notificationService.info)
                .toHaveBeenCalledWith('transferRequest.table.productAlreadyAdded');
        });
    });

    describe('remove', function() {

        it('should remove the line item', function() {
            this.vm.remove(this.vm.lineItems[0]);

            expect(this.vm.lineItems).toEqual([]);
        });
    });

    describe('validateQuantity', function() {

        beforeEach(function() {
            this.lineItem = this.vm.lineItems[0];
        });

        it('should require a quantity', function() {
            this.lineItem.quantity = undefined;

            expect(this.vm.validateQuantity(this.lineItem).$errors.quantityInvalid).toBeTruthy();
        });

        it('should require a positive quantity', function() {
            this.lineItem.quantity = 0;

            expect(this.vm.validateQuantity(this.lineItem).$errors.quantityInvalid).toBeTruthy();
        });

        it('should require a quantity when the packs fields are empty', function() {
            this.vm.quantityUnit = this.QUANTITY_UNIT.PACKS;
            this.lineItem.quantityInPacks = undefined;
            this.lineItem.quantityRemainderInDoses = undefined;
            this.lineItem.quantity = 0;

            expect(this.vm.validateQuantity(this.lineItem).$errors.quantityInvalid).toBeTruthy();
        });

        it('should accept a positive quantity', function() {
            this.lineItem.quantity = 3;

            expect(this.vm.validateQuantity(this.lineItem).$errors.quantityInvalid).toBe(false);
        });
    });

    describe('save', function() {

        it('should save the lines with their quantity in doses', function() {
            spyOn(this.transferService, 'updateRequest').andReturn(this.$q.resolve());

            this.vm.save();
            this.$rootScope.$apply();

            var saved = this.transferService.updateRequest.calls[0].args[0];

            expect(saved.id).toEqual('order-id');
            expect(saved.orderLineItems).toEqual([{
                id: 'line-id',
                orderable: this.orderable('saved', 10),
                orderedQuantity: 25
            }]);

            expect(this.notificationService.success).toHaveBeenCalledWith('transferRequest.save.success');
            expect(this.$state.go).toHaveBeenCalledWith('openlmis.stockmanagement.transfers', {
                tab: 'incoming'
            }, {
                reload: true
            });

            expect(this.loadingModalService.close).toHaveBeenCalled();
        });

        it('should not save a line without a quantity', function() {
            spyOn(this.transferService, 'updateRequest');
            this.vm.lineItems[0].quantity = undefined;

            this.vm.save();

            expect(this.transferService.updateRequest).not.toHaveBeenCalled();
            expect(this.vm.lineItems[0].$errors.quantityInvalid).toBeTruthy();
        });
    });

    describe('send', function() {

        it('should send the request after confirmation and return to the Transfers page', function() {
            spyOn(this.transferService, 'sendRequest').andReturn(this.$q.resolve());

            this.vm.send();
            this.$rootScope.$apply();

            expect(this.confirmService.confirm).toHaveBeenCalled();
            expect(this.transferService.sendRequest.calls[0].args[0].orderLineItems[0].orderedQuantity).toEqual(25);
            expect(this.notificationService.success).toHaveBeenCalledWith('transferRequest.submitted');
            expect(this.$state.go).toHaveBeenCalledWith('openlmis.stockmanagement.transfers', {
                tab: 'incoming'
            }, {
                reload: true
            });
        });

        it('should not send a request without lines', function() {
            spyOn(this.transferService, 'sendRequest');
            this.vm.lineItems = [];

            this.vm.send();

            expect(this.confirmService.confirm).not.toHaveBeenCalled();
            expect(this.transferService.sendRequest).not.toHaveBeenCalled();
        });

        it('should not send when cancelled', function() {
            spyOn(this.transferService, 'sendRequest');
            this.confirmService.confirm.andReturn(this.$q.reject());

            this.vm.send();
            this.$rootScope.$apply();

            expect(this.transferService.sendRequest).not.toHaveBeenCalled();
        });

        it('should keep the lines when the request cannot be sent', function() {
            spyOn(this.transferService, 'sendRequest').andReturn(this.$q.reject({
                status: 400
            }));

            this.vm.send();
            this.$rootScope.$apply();

            expect(this.$state.go).not.toHaveBeenCalled();
            expect(this.vm.lineItems.length).toBe(1);
            expect(this.loadingModalService.close).toHaveBeenCalled();
        });
    });

    describe('delete', function() {

        it('should delete the request after confirmation and return to the Transfers page', function() {
            spyOn(this.transferService, 'deleteRequest').andReturn(this.$q.resolve());

            this.vm.delete();
            this.$rootScope.$apply();

            expect(this.transferService.deleteRequest).toHaveBeenCalledWith('order-id');
            expect(this.notificationService.success).toHaveBeenCalledWith('transferRequest.delete.success');
            expect(this.$state.go).toHaveBeenCalledWith('openlmis.stockmanagement.transfers', {
                tab: 'incoming'
            }, {
                reload: true
            });
        });

        it('should stay on the request when it cannot be deleted', function() {
            spyOn(this.transferService, 'deleteRequest').andReturn(this.$q.reject({
                status: 400
            }));

            this.vm.delete();
            this.$rootScope.$apply();

            expect(this.$state.go).not.toHaveBeenCalled();
        });
    });
});
