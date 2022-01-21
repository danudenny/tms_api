# POD Proxy

## Gateway Usage
PodProxyController will accept any url with `/pod-proxy/*`

`*` is the url redirection to api gateway

format:
```
{pod_base_url}/pod-proxy/{target_url}
```

`target_url` is the url targeted for api gateway

###**Example:**

```
{pod_base_url}/pod-proxy/pod-punishment/v1/categories
```

above request will redirect to api gateway with this url:

```
{api_gateway_base_url}/pod-punishment/v1/categories
```

### Supported Http Method

- GET
- POST
- PUT
- PATCH
- DELETE