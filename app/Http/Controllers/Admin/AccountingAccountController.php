<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Helpers\helpers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Yajra\DataTables\DataTables;
use Carbon\Carbon;

//Models:
use App\Models\Company;
use App\Models\AccountingAccount;
use App\Models\AccountingAccountType;
use App\Models\CompanySettings;
use App\Models\CustomerProviders;
use App\Models\IvaType;
use App\Models\SeatLines;

class AccountingAccountController extends Controller{



}