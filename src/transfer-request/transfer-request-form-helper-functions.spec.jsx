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

import {
    buildTransferRequest,
    goToRequestEdit,
    loadSupplierOptions,
    toSupplierOptions
} from './transfer-request-form-helper-functions';

describe('transfer request form helpers', function() {

    describe('buildTransferRequest', function() {

        it('should request from the supplier for the selected facility and program', function() {
            expect(buildTransferRequest('program-id', 'facility-id', 'supplier-id')).toEqual({
                program: {
                    id: 'program-id'
                },
                requestingFacility: {
                    id: 'facility-id'
                },
                supplyingFacility: {
                    id: 'supplier-id'
                },
                facility: {
                    id: 'facility-id'
                },
                orderLineItems: []
            });
        });
    });

    describe('toSupplierOptions', function() {

        it('should map partners to select options', function() {
            var result = toSupplierOptions([{
                id: 'partner-id',
                name: 'Partner'
            }]);

            expect(result.options).toEqual([{
                name: 'Partner',
                value: 'partner-id'
            }]);

            expect(result.empty).toBe(false);
        });

        it('should flag an empty partner list', function() {
            var result = toSupplierOptions([]);

            expect(result.options).toEqual([]);
            expect(result.empty).toBe(true);
        });
    });

    describe('goToRequestEdit', function() {

        var $q, $rootScope, transferService, history, notificationService;

        beforeEach(function() {
            inject(function($injector) {
                $q = $injector.get('$q');
                $rootScope = $injector.get('$rootScope');
            });

            transferService = jasmine.createSpyObj('transferService', ['createRequest']);
            history = jasmine.createSpyObj('history', ['push']);
            notificationService = jasmine.createSpyObj('notificationService', ['error']);
        });

        it('should open the created request', function() {
            transferService.createRequest.andReturn($q.resolve({
                id: 'order-id'
            }));

            goToRequestEdit({}, transferService, history);
            $rootScope.$apply();

            expect(history.push).toHaveBeenCalledWith('/stockmanagement/transferRequest/order-id');
        });

        it('should leave the error message to the server error handler', function() {
            transferService.createRequest.andReturn($q.reject({
                status: 400,
                data: {
                    message: 'Not a transfer partner'
                }
            }));

            var settled = false;
            goToRequestEdit({}, transferService, history, notificationService)
                .then(function() {
                    settled = true;
                });
            $rootScope.$apply();

            expect(settled).toBe(true);
            expect(history.push).not.toHaveBeenCalled();
            expect(notificationService.error).not.toHaveBeenCalled();
        });
    });

    describe('loadSupplierOptions', function() {

        var $q, $rootScope, transferService;

        beforeEach(function() {
            inject(function($injector) {
                $q = $injector.get('$q');
                $rootScope = $injector.get('$rootScope');
            });

            transferService = jasmine.createSpyObj('transferService', ['getPartners']);
        });

        it('should ask for the partners the facility may request from', function() {
            transferService.getPartners.andReturn($q.resolve([]));

            loadSupplierOptions(transferService, 'program-id', 'facility-id');

            expect(transferService.getPartners).toHaveBeenCalledWith('facility-id', 'program-id', 'REQUEST');
        });

        it('should resolve to the supplier options', function() {
            transferService.getPartners.andReturn($q.resolve([{
                id: 'partner-id',
                name: 'Partner'
            }]));

            var result;
            loadSupplierOptions(transferService, 'program-id', 'facility-id')
                .then(function(response) {
                    result = response;
                });
            $rootScope.$apply();

            expect(result).toEqual({
                options: [{
                    name: 'Partner',
                    value: 'partner-id'
                }],
                empty: false
            });
        });
    });
});
