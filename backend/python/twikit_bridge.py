#!/usr/bin/env python3
"""
Twikit Bridge - Python service for Twitter scraping via twikit library.
Communicates with Node.js via stdin/stdout JSON-RPC protocol.
"""

import sys
import json
import asyncio
import traceback
from typing import Optional, List, Dict, Any
from datetime import datetime

try:
    from twikit import Client
    # twikit 2.x uses TwitterException instead of TwikitException
    try:
        from twikit.errors import TwitterException as TwikitException
    except ImportError:
        from twikit.errors import TwikitException
except ImportError as e:
    print(json.dumps({
        "jsonrpc": "2.0",
        "error": {"code": -32001, "message": f"twikit not installed or import error: {str(e)}. Run: pip install twikit"},
        "id": None
    }), flush=True)
    sys.exit(1)


class TwikitBridge:
    """Bridge class handling Twitter scraping via twikit."""
    
    def __init__(self):
        self.client: Optional[Client] = None
        self.initialized = False
        self.username: Optional[str] = None
        self.email: Optional[str] = None
        self.password: Optional[str] = None
    
    async def initialize(self, username: str, email: str, password: str) -> Dict[str, Any]:
        """Initialize Twitter client with credentials."""
        try:
            self.username = username
            self.email = email
            self.password = password
            
            self.client = Client('en-US')
            
            # Attempt login
            await self.client.login(
                auth_info_1=username,
                auth_info_2=email,
                password=password
            )
            
            self.initialized = True
            
            return {
                "success": True,
                "message": "Twikit client initialized successfully",
                "username": username
            }
            
        except TwikitException as e:
            return {
                "success": False,
                "error": f"Twikit authentication failed: {str(e)}",
                "type": "AUTH_ERROR"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Initialization failed: {str(e)}",
                "type": "UNKNOWN_ERROR",
                "traceback": traceback.format_exc()
            }
    
    async def search_tweets(self, query: str, count: int = 20) -> Dict[str, Any]:
        """Search for tweets matching the query."""
        if not self.initialized or not self.client:
            return {
                "success": False,
                "error": "Client not initialized. Call initialize first.",
                "type": "NOT_INITIALIZED"
            }
        
        try:
            # Search tweets
            tweets = await self.client.search_tweet(query, product='Latest', count=count)
            
            results = []
            
            for tweet in tweets:
                try:
                    # Extract media URLs
                    media_urls = []
                    if hasattr(tweet, 'media') and tweet.media:
                        for media in tweet.media:
                            if hasattr(media, 'media_url_https'):
                                media_urls.append(media.media_url_https)
                    
                    # Extract metrics
                    like_count = getattr(tweet, 'favorite_count', 0) or 0
                    retweet_count = getattr(tweet, 'retweet_count', 0) or 0
                    reply_count = getattr(tweet, 'reply_count', 0) or 0
                    view_count = getattr(tweet, 'view_count', 0) or 0
                    
                    # Parse timestamp
                    created_at = getattr(tweet, 'created_at', None)
                    if created_at:
                        try:
                            timestamp = datetime.strptime(created_at, '%a %b %d %H:%M:%S %z %Y').isoformat()
                        except:
                            timestamp = datetime.now().isoformat()
                    else:
                        timestamp = datetime.now().isoformat()
                    
                    # Extract user info
                    user = getattr(tweet, 'user', None)
                    author_name = getattr(user, 'name', 'Unknown') if user else 'Unknown'
                    author_username = getattr(user, 'screen_name', 'unknown') if user else 'unknown'
                    
                    tweet_data = {
                        "id": getattr(tweet, 'id_str', str(getattr(tweet, 'id', ''))),
                        "text": getattr(tweet, 'full_text', getattr(tweet, 'text', '')),
                        "author": author_name,
                        "username": author_username,
                        "timestamp": timestamp,
                        "url": f"https://twitter.com/{author_username}/status/{getattr(tweet, 'id_str', '')}",
                        "likes": like_count,
                        "retweets": retweet_count,
                        "replies": reply_count,
                        "views": view_count,
                        "images": media_urls,
                        "platform": "twitter"
                    }
                    
                    results.append(tweet_data)
                    
                except Exception as e:
                    # Skip tweets that fail to parse
                    continue
            
            return {
                "success": True,
                "tweets": results,
                "count": len(results),
                "query": query
            }
            
        except TwikitException as e:
            return {
                "success": False,
                "error": f"Twitter API error: {str(e)}",
                "type": "API_ERROR"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Search failed: {str(e)}",
                "type": "UNKNOWN_ERROR",
                "traceback": traceback.format_exc()
            }
    
    async def get_trending(self, count: int = 20) -> Dict[str, Any]:
        """Get trending tweets."""
        if not self.initialized or not self.client:
            return {
                "success": False,
                "error": "Client not initialized. Call initialize first.",
                "type": "NOT_INITIALIZED"
            }
        
        try:
            # Get trending topics
            trends = await self.client.get_trends('trending')
            
            results = []
            
            for trend in trends[:min(count, len(trends))]:
                try:
                    trend_data = {
                        "name": getattr(trend, 'name', ''),
                        "url": getattr(trend, 'url', ''),
                        "tweet_volume": getattr(trend, 'tweet_volume', None),
                        "platform": "twitter"
                    }
                    
                    results.append(trend_data)
                    
                except Exception as e:
                    continue
            
            return {
                "success": True,
                "trends": results,
                "count": len(results)
            }
            
        except TwikitException as e:
            return {
                "success": False,
                "error": f"Twitter API error: {str(e)}",
                "type": "API_ERROR"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Trending fetch failed: {str(e)}",
                "type": "UNKNOWN_ERROR",
                "traceback": traceback.format_exc()
            }


async def handle_request(bridge: TwikitBridge, request: Dict[str, Any]) -> Dict[str, Any]:
    """Handle incoming JSON-RPC request."""
    method = request.get('method')
    params = request.get('params', {})
    request_id = request.get('id')
    
    try:
        if method == 'initialize':
            result = await bridge.initialize(
                username=params.get('username'),
                email=params.get('email'),
                password=params.get('password')
            )
        elif method == 'search':
            result = await bridge.search_tweets(
                query=params.get('query'),
                count=params.get('count', 20)
            )
        elif method == 'trending':
            result = await bridge.get_trending(
                count=params.get('count', 20)
            )
        else:
            return {
                "jsonrpc": "2.0",
                "error": {"code": -32601, "message": f"Method not found: {method}"},
                "id": request_id
            }
        
        return {
            "jsonrpc": "2.0",
            "result": result,
            "id": request_id
        }
        
    except Exception as e:
        return {
            "jsonrpc": "2.0",
            "error": {
                "code": -32603,
                "message": f"Internal error: {str(e)}",
                "data": traceback.format_exc()
            },
            "id": request_id
        }


async def main():
    """Main event loop - read from stdin, process requests, write to stdout."""
    bridge = TwikitBridge()
    
    # Send ready signal
    print(json.dumps({"status": "ready", "version": "1.0.0"}), flush=True)
    
    # Process requests from stdin
    loop = asyncio.get_event_loop()
    
    while True:
        try:
            # Read line from stdin (blocking)
            line = await loop.run_in_executor(None, sys.stdin.readline)
            
            if not line:
                # EOF reached, exit gracefully
                break
            
            line = line.strip()
            if not line:
                continue
            
            # Parse JSON-RPC request
            try:
                request = json.loads(line)
            except json.JSONDecodeError as e:
                response = {
                    "jsonrpc": "2.0",
                    "error": {"code": -32700, "message": f"Parse error: {str(e)}"},
                    "id": None
                }
                print(json.dumps(response), flush=True)
                continue
            
            # Handle request
            response = await handle_request(bridge, request)
            
            # Send response
            print(json.dumps(response), flush=True)
            
        except KeyboardInterrupt:
            break
        except Exception as e:
            error_response = {
                "jsonrpc": "2.0",
                "error": {
                    "code": -32603,
                    "message": f"Server error: {str(e)}",
                    "data": traceback.format_exc()
                },
                "id": None
            }
            print(json.dumps(error_response), flush=True)


if __name__ == '__main__':
    try:
        asyncio.run(main())
    except Exception as e:
        print(json.dumps({
            "status": "error",
            "message": str(e),
            "traceback": traceback.format_exc()
        }), flush=True)
        sys.exit(1)
