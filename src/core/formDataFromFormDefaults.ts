import * as R from 'fp-ts/Record';
import * as O from 'fp-ts/Option';
import { log_error } from "../utils/Log";
import { ModalFormError } from "../utils/ModalFormError";
import type { FormDefinition } from './formDefinition';
import { A, pipe } from '@std';
import type { ModalFormData, Val } from './FormResult';
import { isPrimitiveArray, isPrimitive } from './FormResult';


/**
 * Given a form definition fields and a record containing the expected default values
 * for the form, return a record containing only the values that are present in the form definition
 * and filters out invalid values
 * */
export function formDataFromFormDefaults(fields: FormDefinition['fields'], values: Record<string, unknown>): ModalFormData {
    const result: ModalFormData = {};
    const invalidKeys = [];
    for (const [key, value] of Object.entries(values)) {
        if (Array.isArray(value) && isPrimitiveArray(value)) {
            result[key] = value;
        } else if (isPrimitive(value)) {
            result[key] = value;
        } else {
            invalidKeys.push(key);
        }
    }
    if (invalidKeys.length > 0) {
        log_error(new ModalFormError(`Invalid keys in form options: ${invalidKeys.join(', ')}`));
    }
    return pipe(
        fields,
        A.map((field) => {
            return pipe(
                result[field.name],
                O.fromNullable,
                O.match(() => field.input.type === 'toggle' ? O.some(false) : O.none, O.some),
                O.map((value) => [field.name, value] as [string, Val])
            );
        }),
        A.compact,
        R.fromEntries
    );
}
