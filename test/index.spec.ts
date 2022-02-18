import { test } from 'uvu';
import * as assert from 'uvu/assert';
import * as objectIdentity from '..';
import * as suites from './suites';

suites.API(objectIdentity.identity);