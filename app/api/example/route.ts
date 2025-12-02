/**
 * Example API Route
 *
 * This demonstrates how to create API endpoints in Next.js 13+ App Router.
 * Use this as a template for your own API routes.
 *
 * Route: /api/example
 * Methods: GET, POST
 *
 * Learn more: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
 */

import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

/**
 * GET /api/example
 * Returns example data
 *
 * @example
 * ```ts
 * const response = await fetch("/api/example")
 * const data = await response.json()
 * ```
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters (optional)
    const searchParams = request.nextUrl.searchParams
    const name = searchParams.get("name") || "Guest"

    // Return successful response
    return NextResponse.json(
      {
        success: true,
        message: `Hello, ${name}!`,
        data: {
          timestamp: new Date().toISOString(),
          method: "GET",
        },
      },
      { status: 200 }
    )
  } catch (error) {
    // Handle errors
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "An error occurred",
        },
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/example
 * Accepts data and returns confirmation
 *
 * @example
 * ```ts
 * const response = await fetch("/api/example", {
 *   method: "POST",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify({ name: "John", email: "john@example.com" })
 * })
 * const data = await response.json()
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    // Parse JSON body
    const body = await request.json()

    // Validate input (basic example)
    if (!body.name || !body.email) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Name and email are required",
          },
        },
        { status: 400 }
      )
    }

    // Process the data (example: you would save to database here)
    // await db.users.create(body)

    // Return successful response
    return NextResponse.json(
      {
        success: true,
        message: "Data received successfully",
        data: {
          received: body,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    // Handle errors
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "An error occurred",
        },
      },
      { status: 500 }
    )
  }
}

/**
 * Other HTTP methods you can implement:
 *
 * PUT - Full update of a resource
 * PATCH - Partial update of a resource
 * DELETE - Delete a resource
 * OPTIONS - Return allowed methods (for CORS)
 *
 * @example
 * ```ts
 * export async function PUT(request: NextRequest) {
 *   // Handle PUT request
 * }
 *
 * export async function DELETE(request: NextRequest) {
 *   // Handle DELETE request
 * }
 * ```
 */

/**
 * Tips for API Routes:
 *
 * 1. Validation: Use Zod schemas from /lib/validations
 * 2. Error Handling: Always wrap in try-catch
 * 3. Status Codes: Use appropriate HTTP status codes
 *    - 200: Success
 *    - 201: Created
 *    - 400: Bad Request (validation error)
 *    - 401: Unauthorized
 *    - 404: Not Found
 *    - 500: Internal Server Error
 *
 * 4. Authentication: Check auth before processing
 *    ```ts
 *    const session = await getServerSession(authOptions)
 *    if (!session) {
 *      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
 *    }
 *    ```
 *
 * 5. Database: Connect to your database
 *    ```ts
 *    import { db } from "@/lib/db"
 *    const users = await db.users.findMany()
 *    ```
 */
