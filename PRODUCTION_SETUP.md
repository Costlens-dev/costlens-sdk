# CostLens SDK Production Setup Guide

## 🚀 Production-Ready Configuration

The CostLens SDK is now configured for production use with the following features:

### ✅ Production Features Enabled
- **Smart Routing**: Automatically routes expensive models to cheaper alternatives
- **Auto Optimization**: Optimizes prompts to reduce token usage
- **Caching**: Caches responses to avoid duplicate API calls
- **Auto Fallback**: Falls back to alternative models on failure
- **Cost Tracking**: Tracks usage and costs across all API calls
- **Static Pricing**: Uses reliable static pricing (no dynamic pricing errors)

### 🔧 Configuration

#### Default Production Settings
```javascript
const costlens = new CostLens({
  apiKey: 'your_costlens_api_key',
  baseUrl: 'https://api.costlens.dev',  // Production API
  enableCache: true,                     // Enable caching
  smartRouting: true,                    // Enable smart routing
  autoOptimize: true,                    // Enable prompt optimization
  autoFallback: true,                    // Enable fallback models
  costLimit: 0.10,                       // $0.10 cost limit
  maxRetries: 3                          // 3 retry attempts
});
```

#### Local Development Override
```javascript
const costlens = new CostLens({
  apiKey: 'your_costlens_api_key',
  baseUrl: 'http://localhost:3000',     // Local development
  // ... other settings
});
```

## 📋 Deployment Checklist

### 1. Deploy API Backend
- [ ] Deploy prompt-craft API to production
- [ ] Configure custom domain: `api.costlens.dev`
- [ ] Set up SSL certificate
- [ ] Configure environment variables
- [ ] Test all API endpoints

### 2. Update SDK
- [ ] Publish new SDK version (1.1.0)
- [ ] Update documentation
- [ ] Test with production API

### 3. Monitor Production
- [ ] Set up monitoring for API endpoints
- [ ] Configure alerts for failures
- [ ] Monitor cost savings
- [ ] Track usage patterns

## 🔗 Required API Endpoints

The production API must have these endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/integrations/run` | POST | Track API calls and usage |
| `/api/quality/routing` | GET | Check if smart routing is enabled |
| `/api/cache/get` | POST | Retrieve cached responses |
| `/api/cache/set` | POST | Store cached responses |
| `/api/prompts/optimize` | POST | Optimize prompts for cost efficiency |

## 🧪 Testing Production

### Test Script
```bash
# Test with production API
node index.js --ask "Test production API"

# Test with local API (development)
COSTLENS_API_URL=http://localhost:3000 node index.js --ask "Test local API"
```

### Expected Behavior
- ✅ No "Failed to fetch dynamic pricing" errors
- ✅ Smart routing works (logs model changes)
- ✅ Caching works (logs cache hits)
- ✅ Cost tracking works (tracks usage)
- ✅ Graceful fallback on API failures

## 📊 Production Metrics

Monitor these key metrics:

- **Cost Savings**: Percentage saved through smart routing
- **Cache Hit Rate**: Percentage of requests served from cache
- **API Response Time**: Average response time
- **Error Rate**: Percentage of failed requests
- **Token Usage**: Total tokens used per model

## 🔒 Security Considerations

- Use strong API keys
- Implement rate limiting
- Monitor for abuse
- Regular security audits
- HTTPS only in production

## 🆘 Troubleshooting

### Common Issues

1. **"Tracking failed: Not Found"**
   - API not deployed or wrong URL
   - Check `baseUrl` configuration

2. **"Invalid API key"**
   - Check API key is correct
   - Verify key has proper permissions

3. **"Smart routing disabled"**
   - API key doesn't have routing permissions
   - Check API key configuration

### Support

For production support:
- GitHub Issues: https://github.com/costlens-dev/costlens-sdk/issues
- Documentation: https://costlens.dev
- Email: support@costlens.dev

## 🎉 Success!

Once deployed, your CostLens SDK will:
- Automatically optimize AI costs
- Provide detailed usage analytics
- Scale with your application
- Maintain high quality responses

Welcome to production! 🚀
