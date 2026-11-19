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

describe('TransferSendCreationController', function() {

    beforeEach(function() {
        module('transfer-send', function($provide) {
            $provide.value('featureFlagService', {
                set: function() {},
                get: function() {}
            });
        });

        inject(function($injector) {
            this.$controller = $injector.get('$controller');
            this.messageService = $injector.get('messageService');
            this.quantityUnitCalculateService = $injector.get('quantityUnitCalculateService');
            this.QUANTITY_UNIT = $injector.get('QUANTITY_UNIT');
            this.$q = $injector.get('$q');
            this.$rootScope = $injector.get('$rootScope');
            this.$state = $injector.get('$state');
            this.confirmService = $injector.get('confirmService');
            this.loadingModalService = $injector.get('loadingModalService');
            this.notificationService = $injector.get('notificationService');
            this.transferService = $injector.get('transferService');
        });

        spyOn(this.messageService, 'get').andCallFake(function(key) {
            return key;
        });

        this.vaccine = {
            id: 'vaccine-id',
            productCode: 'V1',
            fullProductName: 'Vaccine',
            netContent: 10,
            meta: {
                versionNumber: 3
            }
        };
        this.syringe = {
            id: 'syringe-id',
            productCode: 'S1',
            fullProductName: 'Syringe',
            netContent: 1,
            meta: {
                versionNumber: 1
            }
        };
        this.firstLot = {
            id: 'lot-1',
            lotCode: 'L1',
            expirationDate: '2030-01-01'
        };
        this.secondLot = {
            id: 'lot-2',
            lotCode: 'L2',
            expirationDate: '2031-01-01'
        };
        this.vaccineGroup = [{
            orderable: this.vaccine,
            lot: this.firstLot,
            stockOnHand: 30
        }, {
            orderable: this.vaccine,
            lot: this.secondLot,
            stockOnHand: 20
        }];
        this.syringeGroup = [{
            orderable: this.syringe,
            lot: null,
            stockOnHand: 5
        }];

        this.vm = this.$controller('TransferSendCreationController', {
            program: {
                id: 'program-id',
                name: 'EPI'
            },
            facility: {
                id: 'facility-id',
                name: 'Sender'
            },
            destination: {
                id: 'partner-id',
                name: 'Receiver'
            },
            orderableGroups: [this.vaccineGroup, this.syringeGroup]
        });
        this.vm.$onInit();

        this.addLot = function(group, lot) {
            this.vm.selectedOrderableGroup = group;
            this.vm.orderableSelectionChanged();
            this.vm.selectedLot = lot;
            this.vm.addProduct();
            return this.vm.lineItems[this.vm.lineItems.length - 1];
        };

        this.validateDoses = function(lineItem, doses) {
            lineItem.quantity = doses;
            return this.vm.validateQuantity(lineItem);
        };
    });

    describe('$onInit', function() {

        it('should start with the products in stock and no line items', function() {
            expect(this.vm.orderableGroups).toEqual([this.vaccineGroup, this.syringeGroup]);
            expect(this.vm.lineItems).toEqual([]);
        });
    });

    describe('orderableSelectionChanged', function() {

        it('should offer the lots of the selected product', function() {
            this.vm.selectedLot = this.firstLot;
            this.vm.selectedOrderableGroup = this.vaccineGroup;

            this.vm.orderableSelectionChanged();

            expect(this.vm.lots).toEqual([this.firstLot, this.secondLot]);
            expect(this.vm.selectedOrderableHasLots).toBe(true);
            expect(this.vm.selectedLot).toBeNull();
        });

        it('should not ask for a lot for a product without lots', function() {
            this.vm.selectedOrderableGroup = this.syringeGroup;

            this.vm.orderableSelectionChanged();

            expect(this.vm.selectedOrderableHasLots).toBe(false);
        });
    });

    describe('addProduct', function() {

        it('should add the selected lot with its stock on hand', function() {
            var lineItem = this.addLot(this.vaccineGroup, this.secondLot);

            expect(this.vm.lineItems.length).toBe(1);
            expect(lineItem.orderable).toBe(this.vaccine);
            expect(lineItem.lot).toBe(this.secondLot);
            expect(lineItem.stockOnHand).toBe(20);
            expect(lineItem.$errors).toEqual({});
        });

        it('should add a product without lots', function() {
            var lineItem = this.addLot(this.syringeGroup, null);

            expect(lineItem.orderable).toBe(this.syringe);
            expect(lineItem.lot).toBeNull();
            expect(lineItem.stockOnHand).toBe(5);
        });

        it('should not add the same lot twice', function() {
            this.addLot(this.vaccineGroup, this.firstLot);
            this.addLot(this.vaccineGroup, this.firstLot);

            expect(this.vm.lineItems.length).toBe(1);
        });

        it('should tell the user when the lot is already on the list', function() {
            spyOn(this.notificationService, 'info');

            this.addLot(this.vaccineGroup, this.firstLot);

            expect(this.notificationService.info).not.toHaveBeenCalled();

            this.addLot(this.vaccineGroup, this.firstLot);

            expect(this.notificationService.info).toHaveBeenCalledWith('transferSend.alreadyAdded');
        });

        it('should add other lots of the same product', function() {
            this.addLot(this.vaccineGroup, this.firstLot);
            this.addLot(this.vaccineGroup, this.secondLot);

            expect(this.vm.lineItems.length).toBe(2);
        });
    });

    describe('remove', function() {

        it('should remove the line item', function() {
            var first = this.addLot(this.vaccineGroup, this.firstLot),
                second = this.addLot(this.vaccineGroup, this.secondLot);

            this.vm.remove(first);

            expect(this.vm.lineItems).toEqual([second]);
        });
    });

    describe('validateQuantity', function() {

        beforeEach(function() {
            this.lineItem = this.addLot(this.vaccineGroup, this.secondLot);
        });

        it('should require a quantity', function() {
            expect(this.validateDoses(this.lineItem, undefined).$errors.quantityInvalid)
                .toEqual('openlmisForm.required');
        });

        it('should reject a zero quantity', function() {
            expect(this.validateDoses(this.lineItem, 0).$errors.quantityInvalid)
                .toEqual('transferSend.positiveQuantity');
        });

        it('should reject more than the stock on hand', function() {
            expect(this.validateDoses(this.lineItem, 30).$errors.quantityInvalid)
                .toEqual('transferSend.quantityGreaterThanStockOnHand');
        });

        it('should reject a quantity that is not a whole number of packs', function() {
            expect(this.validateDoses(this.lineItem, 15).$errors.quantityInvalid)
                .toEqual('transferSend.wholePacksOnly');
        });

        it('should accept whole packs up to the stock on hand', function() {
            expect(this.validateDoses(this.lineItem, 10).$errors.quantityInvalid).toBe(false);
            expect(this.validateDoses(this.lineItem, 20).$errors.quantityInvalid).toBe(false);
        });

        it('should accept any quantity of a product counted in single doses', function() {
            var syringes = this.addLot(this.syringeGroup, null);

            expect(this.validateDoses(syringes, 3).$errors.quantityInvalid).toBe(false);
        });

        it('should reject any quantity of a product without a pack size', function() {
            var unpacked = this.addLot([{
                orderable: {
                    id: 'unpacked-id',
                    netContent: 0,
                    meta: {
                        versionNumber: 1
                    }
                },
                lot: null,
                stockOnHand: 10
            }], null);

            expect(this.validateDoses(unpacked, 5).$errors.quantityInvalid).toEqual('transferSend.noPackSize');
        });

        it('should require a quantity when the packs input is empty', function() {
            this.vm.quantityUnit = this.QUANTITY_UNIT.PACKS;
            this.lineItem.quantityInPacks = '';
            this.lineItem.quantityRemainderInDoses = '';

            expect(this.vm.validateQuantity(this.lineItem).$errors.quantityInvalid)
                .toEqual('openlmisForm.required');
        });
    });

    describe('showInDoses', function() {

        it('should follow the selected quantity unit', function() {
            this.vm.quantityUnit = this.QUANTITY_UNIT.DOSES;

            expect(this.vm.showInDoses()).toBe(true);

            this.vm.quantityUnit = this.QUANTITY_UNIT.PACKS;

            expect(this.vm.showInDoses()).toBe(false);
        });
    });

    describe('recalculateSOHQuantity', function() {

        it('should show the stock on hand in the selected unit', function() {
            spyOn(this.quantityUnitCalculateService, 'recalculateSOHQuantity').andReturn('2 ( +0 )');
            this.vm.quantityUnit = this.QUANTITY_UNIT.PACKS;

            expect(this.vm.recalculateSOHQuantity(20, 10)).toEqual('2 ( +0 )');
            expect(this.quantityUnitCalculateService.recalculateSOHQuantity).toHaveBeenCalledWith(20, 10, false);
        });
    });

    describe('canSubmit', function() {

        it('should not allow submitting without line items', function() {
            expect(this.vm.canSubmit()).toBe(false);
        });

        it('should not allow submitting while a line item is invalid', function() {
            this.validateDoses(this.addLot(this.vaccineGroup, this.firstLot), 10);
            this.validateDoses(this.addLot(this.vaccineGroup, this.secondLot), 15);

            expect(this.vm.canSubmit()).toBe(false);
        });

        it('should allow submitting while a quantity is still to be entered, so submit can point at it', function() {
            this.validateDoses(this.addLot(this.vaccineGroup, this.firstLot), 10);
            this.addLot(this.vaccineGroup, this.secondLot);

            expect(this.vm.canSubmit()).toBe(true);
        });

        it('should allow submitting when every line item is valid', function() {
            this.validateDoses(this.addLot(this.vaccineGroup, this.firstLot), 10);
            this.validateDoses(this.addLot(this.syringeGroup, null), 3);

            expect(this.vm.canSubmit()).toBe(true);
        });
    });

    describe('submit', function() {

        beforeEach(function() {
            this.vm.quantityUnit = this.QUANTITY_UNIT.DOSES;
            this.vaccineLine = this.addLot(this.vaccineGroup, this.secondLot);
            this.syringeLine = this.addLot(this.syringeGroup, null);
            this.vaccineLine.quantity = 20;
            this.syringeLine.quantity = 3;

            this.sendDeferred = this.$q.defer();
            spyOn(this.confirmService, 'confirm').andReturn(this.$q.resolve());
            spyOn(this.transferService, 'send').andReturn(this.sendDeferred.promise);
            spyOn(this.loadingModalService, 'open');
            spyOn(this.loadingModalService, 'close');
            spyOn(this.notificationService, 'success');
            spyOn(this.notificationService, 'error');
            spyOn(this.$state, 'go');
        });

        it('should not send anything while a line item is invalid', function() {
            this.syringeLine.quantity = 6;

            this.vm.submit();
            this.$rootScope.$apply();

            expect(this.syringeLine.$errors.quantityInvalid).toEqual('transferSend.quantityGreaterThanStockOnHand');
            expect(this.confirmService.confirm).not.toHaveBeenCalled();
            expect(this.transferService.send).not.toHaveBeenCalled();
        });

        it('should flag a line item without a quantity instead of sending', function() {
            this.syringeLine.quantity = undefined;

            this.vm.submit();
            this.$rootScope.$apply();

            expect(this.syringeLine.$errors.quantityInvalid).toEqual('openlmisForm.required');
            expect(this.confirmService.confirm).not.toHaveBeenCalled();
            expect(this.transferService.send).not.toHaveBeenCalled();
        });

        it('should ask to confirm the source, destination, program and number of line items', function() {
            this.vm.submit();
            this.$rootScope.$apply();

            expect(this.messageService.get).toHaveBeenCalledWith('transferSend.confirm', {
                count: 2,
                facility: 'Sender',
                destination: 'Receiver',
                program: 'EPI'
            });

            expect(this.confirmService.confirm).toHaveBeenCalledWith('transferSend.confirm', 'transferSend.send');
        });

        it('should not send anything when the confirmation is cancelled', function() {
            this.confirmService.confirm.andReturn(this.$q.reject());

            this.vm.submit();
            this.$rootScope.$apply();

            expect(this.transferService.send).not.toHaveBeenCalled();
        });

        it('should send the line items once, in whole packs', function() {
            this.vm.submit();
            this.$rootScope.$apply();

            expect(this.transferService.send.callCount).toBe(1);
            expect(this.transferService.send).toHaveBeenCalledWith({
                programId: 'program-id',
                supplyingFacilityId: 'facility-id',
                receivingFacilityId: 'partner-id',
                lineItems: [{
                    orderable: {
                        id: 'vaccine-id',
                        versionNumber: 3
                    },
                    lotId: 'lot-2',
                    quantity: 2
                }, {
                    orderable: {
                        id: 'syringe-id',
                        versionNumber: 1
                    },
                    lotId: null,
                    quantity: 3
                }]
            });

            expect(this.loadingModalService.open).toHaveBeenCalled();
        });

        it('should notify and start a new reallocation once sent', function() {
            this.vm.submit();
            this.sendDeferred.resolve({
                id: 'order-id'
            });
            this.$rootScope.$apply();

            expect(this.notificationService.success).toHaveBeenCalledWith('transferSend.submitted');
            expect(this.$state.go).toHaveBeenCalledWith('openlmis.stockmanagement.transferSend', {
                programId: 'program-id',
                facilityId: 'facility-id',
                destinationId: null
            }, {
                reload: true
            });
        });

        it('should close the loading modal once sent', function() {
            this.vm.submit();
            this.sendDeferred.resolve({
                id: 'order-id'
            });
            this.$rootScope.$apply();

            expect(this.loadingModalService.close).toHaveBeenCalled();
        });

        it('should keep the line items on a server error and not show the message again', function() {
            this.vm.submit();
            this.sendDeferred.reject({
                status: 400,
                data: {
                    message: 'Not enough stock'
                }
            });
            this.$rootScope.$apply();

            expect(this.loadingModalService.close).toHaveBeenCalled();
            expect(this.vm.lineItems).toEqual([this.vaccineLine, this.syringeLine]);
            expect(this.$state.go).not.toHaveBeenCalled();
            expect(this.notificationService.success).not.toHaveBeenCalled();
            expect(this.notificationService.error).not.toHaveBeenCalled();
        });
    });
});
