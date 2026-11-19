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
                id: 'program-id'
            },
            facility: {
                id: 'facility-id'
            },
            destination: {
                id: 'partner-id'
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
});
