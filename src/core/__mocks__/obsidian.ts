import { stringify } from 'yaml'
export function stringifyYaml(data: unknown) {
    return stringify(data)
}
