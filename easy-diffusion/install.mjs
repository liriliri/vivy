#!/usr/bin/env zx
import { installPackages } from './mamba.mjs'

await installPackages(['conda', 'python=3.8.5', 'git']);

