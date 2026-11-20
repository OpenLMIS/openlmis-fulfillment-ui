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
     * @name transfer-request.controller:TransferRequestTableController
     *
     * @description
     * Picks the products of a transfer request and their quantities, then saves, sends or deletes it.
     * Quantities are kept in doses; the doses/packs toggle changes only how they are entered and shown.
     */
    angular
        .module('transfer-request')
        .controller('TransferRequestTableController', controller);

    controller.$inject = [
        '$state', 'order', 'stockCardSummaries', 'quantityUnitCalculateService', 'messageService', 'QUANTITY_UNIT',
        'confirmService', 'loadingModalService', 'notificationService', 'transferService'
    ];

    function controller($state, order, stockCardSummaries, quantityUnitCalculateService, messageService,
                        QUANTITY_UNIT, confirmService, loadingModalService, notificationService, transferService) {
        var vm = this;

        vm.$onInit = onInit;
        vm.addProduct = addProduct;
        vm.remove = remove;
        vm.validateQuantity = validateQuantity;
        vm.showInDoses = showInDoses;
        vm.recalculateSOHQuantity = recalculateSOHQuantity;
        vm.canSend = canSend;
        vm.save = save;
        vm.send = send;
        vm.delete = deleteRequest;

        function onInit() {
            vm.order = order;
            vm.stockCardSummaries = stockCardSummaries;
            vm.quantityUnit = undefined;
            vm.lineItems = order.orderLineItems.map(toLineItem);
        }

        /**
         * @ngdoc method
         * @methodOf transfer-request.controller:TransferRequestTableController
         * @name addProduct
         *
         * @description
         * Adds the selected product. A product already on the list is not added again; the user is told so.
         */
        function addProduct() {
            var summary = vm.selectedStockCardSummary;

            if (!summary) {
                return;
            }
            if (isAdded(summary.orderable)) {
                notificationService.info('transferRequest.table.productAlreadyAdded');
                return;
            }

            vm.lineItems.push({
                orderable: {
                    id: summary.orderable.id,
                    productCode: summary.orderable.productCode,
                    fullProductName: summary.orderable.fullProductName,
                    meta: {
                        versionNumber: summary.orderable.meta.versionNumber
                    },
                    netContent: summary.orderable.netContent,
                    packRoundingThreshold: summary.orderable.packRoundingThreshold,
                    roundToZero: summary.orderable.roundToZero
                },
                stockOnHand: summary.stockOnHand,
                quantity: undefined,
                $errors: {}
            });
        }

        /**
         * @ngdoc method
         * @methodOf transfer-request.controller:TransferRequestTableController
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
         * @methodOf transfer-request.controller:TransferRequestTableController
         * @name validateQuantity
         *
         * @description
         * Validates that the quantity is entered and positive.
         *
         * @param  {Object} lineItem the line item to validate
         * @return {Object}          the line item, with $errors.quantityInvalid set to a message or false
         */
        function validateQuantity(lineItem) {
            if (isPacksInputEmpty(lineItem) || isBlank(lineItem.quantity)) {
                lineItem.$errors.quantityInvalid = messageService.get('openlmisForm.required');
            } else if (lineItem.quantity < 1) {
                lineItem.$errors.quantityInvalid = messageService.get('transferRequest.positiveQuantity');
            } else {
                lineItem.$errors.quantityInvalid = false;
            }

            return lineItem;
        }

        /**
         * @ngdoc method
         * @methodOf transfer-request.controller:TransferRequestTableController
         * @name showInDoses
         *
         * @return {boolean} true if quantities are shown in doses, false if in packs
         */
        function showInDoses() {
            return vm.quantityUnit === QUANTITY_UNIT.DOSES;
        }

        /**
         * @ngdoc method
         * @methodOf transfer-request.controller:TransferRequestTableController
         * @name recalculateSOHQuantity
         *
         * @param  {Number} stockOnHand the stock on hand, in doses
         * @param  {Number} netContent  the pack size
         * @return {String}             the stock on hand in the selected unit
         */
        function recalculateSOHQuantity(stockOnHand, netContent) {
            return quantityUnitCalculateService.recalculateSOHQuantity(stockOnHand, netContent, showInDoses());
        }

        /**
         * @ngdoc method
         * @methodOf transfer-request.controller:TransferRequestTableController
         * @name canSend
         *
         * @return {boolean} true if there is at least one line item and none shows an error; a quantity not
         *                   entered yet doesn't count, so that sending can point at it
         */
        function canSend() {
            return vm.lineItems.length > 0 && !hasErrors();
        }

        /**
         * @ngdoc method
         * @methodOf transfer-request.controller:TransferRequestTableController
         * @name save
         *
         * @description
         * Validates every line item and saves the request as a draft.
         */
        function save() {
            if (!validate()) {
                return;
            }

            loadingModalService.open();
            transferService.updateRequest(buildOrder())
                .then(function() {
                    notificationService.success('transferRequest.save.success');
                })
                // the server error handler already shows the backend message
                .catch(angular.noop)
                .finally(loadingModalService.close);
        }

        /**
         * @ngdoc method
         * @methodOf transfer-request.controller:TransferRequestTableController
         * @name send
         *
         * @description
         * Validates every line item, asks for confirmation and sends the request to the supplying facility.
         * Once sent, the page starts over with the same program. On an error the line items stay for correction.
         */
        function send() {
            if (!validate() || !canSend()) {
                return;
            }

            confirmService.confirm(messageService.get('transferRequest.send.confirm', {
                count: vm.lineItems.length,
                program: vm.order.program.name,
                supplyingFacility: vm.order.supplyingFacility.name
            }), 'transferRequest.send')
                .then(function() {
                    loadingModalService.open();
                    return transferService.sendRequest(buildOrder())
                        .then(function() {
                            notificationService.success('transferRequest.submitted');
                            goToForm();
                        })
                        .catch(angular.noop)
                        .finally(loadingModalService.close);
                });
        }

        /**
         * @ngdoc method
         * @methodOf transfer-request.controller:TransferRequestTableController
         * @name delete
         *
         * @description
         * Asks for confirmation and deletes the request.
         */
        function deleteRequest() {
            confirmService.confirmDestroy('transferRequest.delete.prompt', 'transferRequest.delete')
                .then(function() {
                    loadingModalService.open();
                    return transferService.deleteRequest(vm.order.id)
                        .then(function() {
                            notificationService.success('transferRequest.delete.success');
                            goToForm();
                        })
                        .catch(angular.noop)
                        .finally(loadingModalService.close);
                });
        }

        function toLineItem(orderLineItem) {
            var lineItem = angular.extend(angular.copy(orderLineItem), {
                stockOnHand: getStockOnHand(orderLineItem.orderable),
                quantity: orderLineItem.orderedQuantity,
                $errors: {}
            });

            // fills the packs fields, so that the quantity shows when the toggle is on packs
            quantityUnitCalculateService.recalculateInputQuantity(lineItem, lineItem.orderable.netContent, true);
            return lineItem;
        }

        function buildOrder() {
            return angular.extend({}, vm.order, {
                orderLineItems: vm.lineItems.map(function(lineItem) {
                    var orderLineItem = angular.extend({}, lineItem, {
                        orderedQuantity: lineItem.quantity
                    });

                    delete orderLineItem.quantity;
                    delete orderLineItem.quantityInPacks;
                    delete orderLineItem.quantityRemainderInDoses;
                    delete orderLineItem.stockOnHand;
                    delete orderLineItem.$errors;
                    return orderLineItem;
                })
            });
        }

        function validate() {
            vm.lineItems.forEach(validateQuantity);
            return !hasErrors();
        }

        function hasErrors() {
            return vm.lineItems.some(function(lineItem) {
                return lineItem.$errors.quantityInvalid;
            });
        }

        function goToForm() {
            $state.go('openlmis.stockmanagement.transferRequest', {
                programId: vm.order.program.id
            }, {
                reload: true
            });
        }

        function getStockOnHand(orderable) {
            var summary = stockCardSummaries.filter(function(stockCardSummary) {
                return stockCardSummary.orderable.id === orderable.id;
            })[0];

            return summary ? summary.stockOnHand : 0;
        }

        function isAdded(orderable) {
            return vm.lineItems.some(function(lineItem) {
                return lineItem.orderable.id === orderable.id;
            });
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
