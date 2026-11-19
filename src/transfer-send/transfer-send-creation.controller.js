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

(function() {

    'use strict';

    /**
     * @ngdoc controller
     * @name transfer-send.controller:TransferSendCreationController
     *
     * @description
     * Picks the products and lots sent to the destination, with their quantities. Quantities are kept
     * in doses; the doses/packs toggle changes only how they are entered and shown.
     */
    angular
        .module('transfer-send')
        .controller('TransferSendCreationController', controller);

    controller.$inject = [
        'program', 'facility', 'destination', 'orderableGroups', 'orderableGroupService',
        'quantityUnitCalculateService', 'messageService', 'QUANTITY_UNIT'
    ];

    function controller(program, facility, destination, orderableGroups, orderableGroupService,
                        quantityUnitCalculateService, messageService, QUANTITY_UNIT) {
        var vm = this;

        vm.$onInit = onInit;
        vm.orderableSelectionChanged = orderableSelectionChanged;
        vm.addProduct = addProduct;
        vm.remove = remove;
        vm.validateQuantity = validateQuantity;
        vm.showInDoses = showInDoses;
        vm.recalculateSOHQuantity = recalculateSOHQuantity;

        function onInit() {
            vm.program = program;
            vm.facility = facility;
            vm.destination = destination;
            vm.orderableGroups = orderableGroups;
            vm.lineItems = [];
            vm.quantityUnit = undefined;
        }

        /**
         * @ngdoc method
         * @methodOf transfer-send.controller:TransferSendCreationController
         * @name orderableSelectionChanged
         *
         * @description
         * Lists the lots of the selected product and clears the previously selected lot.
         */
        function orderableSelectionChanged() {
            vm.selectedLot = null;
            vm.lots = orderableGroupService.lotsOf(vm.selectedOrderableGroup, false);
            vm.selectedOrderableHasLots = vm.lots.length > 0;
        }

        /**
         * @ngdoc method
         * @methodOf transfer-send.controller:TransferSendCreationController
         * @name addProduct
         *
         * @description
         * Adds the selected product and lot, unless that lot is already on the list.
         */
        function addProduct() {
            var item = orderableGroupService.findByLotInOrderableGroup(vm.selectedOrderableGroup, vm.selectedLot);

            if (!item || isAdded(item)) {
                return;
            }

            vm.lineItems.push({
                orderable: item.orderable,
                lot: item.lot,
                stockOnHand: item.stockOnHand,
                quantity: undefined,
                $errors: {}
            });
        }

        /**
         * @ngdoc method
         * @methodOf transfer-send.controller:TransferSendCreationController
         * @name remove
         *
         * @description
         * Removes the line item from the list.
         *
         * @param {Object} lineItem the line item to remove
         */
        function remove(lineItem) {
            vm.lineItems.splice(vm.lineItems.indexOf(lineItem), 1);
        }

        /**
         * @ngdoc method
         * @methodOf transfer-send.controller:TransferSendCreationController
         * @name validateQuantity
         *
         * @description
         * Validates the quantity, in doses, against the stock on hand. The transfer is sent in whole
         * packs, so a quantity that leaves a remainder of doses is rejected.
         *
         * @param  {Object} lineItem the line item to validate
         * @return {Object}          the line item, with $errors.quantityInvalid set to a message or false
         */
        function validateQuantity(lineItem) {
            var quantity = lineItem.quantity;

            if (isPacksInputEmpty(lineItem) || isBlank(quantity)) {
                lineItem.$errors.quantityInvalid = messageService.get('openlmisForm.required');
            } else if (quantity < 1) {
                lineItem.$errors.quantityInvalid = messageService.get('transferSend.positiveQuantity');
            } else if (quantity > lineItem.stockOnHand) {
                lineItem.$errors.quantityInvalid = messageService.get('transferSend.quantityGreaterThanStockOnHand');
            } else if (quantity % lineItem.orderable.netContent > 0) {
                lineItem.$errors.quantityInvalid = messageService.get('transferSend.wholePacksOnly');
            } else {
                lineItem.$errors.quantityInvalid = false;
            }

            return lineItem;
        }

        /**
         * @ngdoc method
         * @methodOf transfer-send.controller:TransferSendCreationController
         * @name showInDoses
         *
         * @return {boolean} true if quantities are shown in doses, false if in packs
         */
        function showInDoses() {
            return vm.quantityUnit === QUANTITY_UNIT.DOSES;
        }

        /**
         * @ngdoc method
         * @methodOf transfer-send.controller:TransferSendCreationController
         * @name recalculateSOHQuantity
         *
         * @param  {Number} stockOnHand the stock on hand, in doses
         * @param  {Number} netContent  the pack size
         * @return {String}             the stock on hand in the selected unit
         */
        function recalculateSOHQuantity(stockOnHand, netContent) {
            return quantityUnitCalculateService.recalculateSOHQuantity(stockOnHand, netContent, showInDoses());
        }

        function isAdded(item) {
            return vm.lineItems.some(function(lineItem) {
                return lineItem.orderable.id === item.orderable.id && getLotId(lineItem) === getLotId(item);
            });
        }

        function getLotId(item) {
            return item.lot ? item.lot.id : null;
        }

        function isPacksInputEmpty(lineItem) {
            // the quantity input turns empty packs fields into 0 doses, which would read as a zero quantity
            return vm.quantityUnit === QUANTITY_UNIT.PACKS && isBlank(lineItem.quantityInPacks) &&
                isBlank(lineItem.quantityRemainderInDoses);
        }

        function isBlank(value) {
            return value === undefined || value === null || value === '' || isNaN(value);
        }
    }
})();
