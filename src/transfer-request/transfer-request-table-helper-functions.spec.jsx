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

import { deleteRequest, isRequestValid, loadRequest } from './transfer-request-table-helper-functions';

describe('transfer request table helpers', function() {

    describe('isRequestValid', function() {

        it('should not accept a request without lines', function() {
            expect(isRequestValid({
                id: 'order-id',
                orderLineItems: []
            })).toBe(false);
        });

        it('should not accept a line without a positive quantity', function() {
            expect(isRequestValid({
                id: 'order-id',
                orderLineItems: [{
                    orderedQuantity: 10
                }, {
                    orderedQuantity: ''
                }]
            })).toBe(false);

            expect(isRequestValid({
                id: 'order-id',
                orderLineItems: [{
                    orderedQuantity: 0
                }]
            })).toBe(false);
        });

        it('should accept a saved request whose lines all have a positive quantity', function() {
            expect(isRequestValid({
                id: 'order-id',
                orderLineItems: [{
                    orderedQuantity: 10
                }]
            })).toBe(true);
        });

        it('should not accept a request that is not loaded yet', function() {
            expect(isRequestValid(undefined)).toBe(false);
        });
    });

    describe('deleteRequest', function() {

        var $q, $rootScope, transferRequestService, notificationService;

        beforeEach(function() {
            inject(function($injector) {
                $q = $injector.get('$q');
                $rootScope = $injector.get('$rootScope');
            });

            transferRequestService = jasmine.createSpyObj('transferRequestService', ['delete']);
            notificationService = jasmine.createSpyObj('notificationService', ['success', 'error']);
        });

        it('should delete the request and report it', function() {
            transferRequestService.delete.andReturn($q.resolve());

            var deleted;
            deleteRequest('order-id', transferRequestService, notificationService)
                .then(function(result) {
                    deleted = result;
                });
            $rootScope.$apply();

            expect(transferRequestService.delete).toHaveBeenCalledWith(['order-id']);
            expect(notificationService.success).toHaveBeenCalledWith('transferRequest.delete.success');
            expect(deleted).toBe(true);
        });

        it('should leave a failed delete to the server error handler and settle', function() {
            transferRequestService.delete.andReturn($q.reject({
                status: 400
            }));

            var deleted;
            deleteRequest('order-id', transferRequestService, notificationService)
                .then(function(result) {
                    deleted = result;
                });
            $rootScope.$apply();

            expect(notificationService.error).not.toHaveBeenCalled();
            expect(notificationService.success).not.toHaveBeenCalled();
            expect(deleted).toBe(false);
        });
    });

    describe('loadRequest', function() {

        var orderService, stockCardSummaryRepositoryImpl;

        beforeEach(function() {
            orderService = jasmine.createSpyObj('orderService', ['get']);
            stockCardSummaryRepositoryImpl = jasmine.createSpyObj('stockCardSummaryRepositoryImpl', ['query']);
        });

        it('should resolve to the request', function() {
            var order = {
                id: 'order-id',
                orderLineItems: []
            };
            orderService.get.andReturn(Promise.resolve(order));

            var result;
            runs(function() {
                loadRequest('order-id', orderService, stockCardSummaryRepositoryImpl)
                    .then(function(loaded) {
                        result = loaded;
                    });
            });
            waitsFor(function() {
                return result !== undefined;
            }, 'the request to load', 1000);
            runs(function() {
                expect(orderService.get).toHaveBeenCalledWith('order-id');
                expect(result).toEqual(order);
            });
        });

        it('should reject when the request cannot be read, so the page can leave', function() {
            orderService.get.andReturn(Promise.reject({
                status: 403
            }));

            var rejection;
            runs(function() {
                loadRequest('order-id', orderService, stockCardSummaryRepositoryImpl)
                    .catch(function(response) {
                        rejection = response;
                    });
            });
            waitsFor(function() {
                return rejection !== undefined;
            }, 'the load to fail', 1000);
            runs(function() {
                expect(rejection.status).toEqual(403);
            });
        });
    });
});
