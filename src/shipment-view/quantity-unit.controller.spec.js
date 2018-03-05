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

describe('QuantityUnitController', function() {

    var vm, $controller, messageService, QUANTITY_UNIT;

    beforeEach(function() {
        module('shipment-view');

        inject(function($injector) {
            $controller = $injector.get('$controller');
            messageService = $injector.get('messageService');
            QUANTITY_UNIT = $injector.get('QUANTITY_UNIT');
        });

        vm = $controller('QuantityUnitController', {
            messageService: messageService,
        });
    });

    describe('onInit', function() {

        beforeEach(function() {
            vm.$onInit();
        });

        it('should expose quantityUnits', function() {
            expect(vm.quantityUnits).toEqual([
                QUANTITY_UNIT.PACKS,
                QUANTITY_UNIT.DOSES
            ]);
        });

        it('should expose quantityUnit', function() {
            expect(vm.quantityUnit).toEqual(QUANTITY_UNIT.PACKS);
        });
    });

    describe('getMessage', function() {

        beforeEach(function() {
            spyOn(messageService, 'get').andReturn('message');
        });

        it('should get localized message for packs', function() {
            expect(vm.getMessage(QUANTITY_UNIT.PACKS)).toEqual('message');

            expect(messageService.get).toHaveBeenCalledWith('shipmentView.packs');
        });

        it('should get localized message for doses', function() {
            expect(vm.getMessage(QUANTITY_UNIT.DOSES)).toEqual('message');

            expect(messageService.get).toHaveBeenCalledWith('shipmentView.doses');
        });
    });

});
