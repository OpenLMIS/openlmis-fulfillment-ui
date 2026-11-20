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
     * @name transfer-request.controller:TransferRequestController
     *
     * @description
     * Selects the program and the facility the stock is requested from, and creates the request. The stock
     * is always requested for the user's home facility.
     */
    angular
        .module('transfer-request')
        .controller('TransferRequestController', controller);

    controller.$inject = [
        '$state', '$stateParams', 'programs', 'facility', 'partners', 'transferService', 'loadingModalService'
    ];

    function controller($state, $stateParams, programs, facility, partners, transferService, loadingModalService) {
        var vm = this;

        vm.$onInit = onInit;
        vm.search = search;
        vm.create = create;

        function onInit() {
            vm.programs = programs;
            vm.facility = facility;
            vm.partners = partners;
            vm.program = findById(programs, $stateParams.programId) || getOnly(programs);
            vm.supplyingFacility = getOnly(partners);
            vm.noPartners = Boolean($stateParams.programId) && Boolean(facility) && partners.length === 0;

            // a select with a single option is filled without a change event, so nothing else would load the partners
            if (!$stateParams.programId) {
                search();
            }
        }

        /**
         * @ngdoc method
         * @methodOf transfer-request.controller:TransferRequestController
         * @name search
         *
         * @description
         * Reloads the page with the selected program, which loads the facilities the home facility may
         * request from.
         */
        function search() {
            if (!vm.program) {
                return;
            }

            $state.go('openlmis.stockmanagement.transferRequest', {
                programId: vm.program.id
            }, {
                reload: true
            });
        }

        /**
         * @ngdoc method
         * @methodOf transfer-request.controller:TransferRequestController
         * @name create
         *
         * @description
         * Creates the transfer request and opens it for adding products.
         */
        function create() {
            if (!vm.program || !vm.supplyingFacility) {
                return;
            }

            loadingModalService.open();
            transferService.createRequest({
                program: {
                    id: vm.program.id
                },
                requestingFacility: {
                    id: vm.facility.id
                },
                supplyingFacility: {
                    id: vm.supplyingFacility.id
                },
                facility: {
                    id: vm.facility.id
                },
                orderLineItems: []
            })
                .then(function(order) {
                    $state.go('openlmis.stockmanagement.transferRequest.table', {
                        programId: vm.program.id,
                        orderId: order.id
                    });
                })
                // the server error handler already shows the backend message
                .catch(angular.noop)
                .finally(loadingModalService.close);
        }

        function findById(items, id) {
            return items.filter(function(item) {
                return item.id === id;
            })[0];
        }

        function getOnly(items) {
            return items.length === 1 ? items[0] : undefined;
        }
    }
})();
