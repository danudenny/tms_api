# POD Proxy

## Gateway Usage
PodProxyController will accept any url with `/pod-proxy/*`

`*` is the url redirection to api internal

format:
```
{pod_base_url}/pod-proxy/{target_service}/{target_url}
```

`target_url` is the url targeted for api internal

###**Example:**

```
{pod_base_url}/pod-proxy/pod-punishment/v1/categories
```

above request will redirect to api internal with this url:

```
{api_internal_base_url}/{namespace}/{app_name}/pod-punishment/v1/categories
```

### Supported Http Method

- GET
- POST
- PUT
- PATCH
- DELETE

## Add Config
Add new config in `proxy.allowedService`

Format
```
{
    "{target_service}": {
        destination: "/{namespace}/{app_name}"
    }
}
```

`target_service` : mapping proxy with service name, will be us as target_service
