import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from "../../environments/environment";

@Injectable()
export class AuthService {

    readonly BASE_URL = environment.apiUrl;

    constructor(
        public httpClient: HttpClient
    ) {

    }

}
