// src/server.ts
import handler, { createServerEntry } from '@tanstack/react-start/server-entry'
import { createAgent } from 'honidev'


type MyRequestContext = {
    hello: string
    foo: number
}

declare module '@tanstack/react-start' {
    interface Register {
        server: {
            requestContext: MyRequestContext
        }
    }
}

export default createServerEntry({
    fetch(request) {
        return handler.fetch(request, {

        })
    },
})


export const agent = createAgent({
    name: 'my-agent',
    model: 'claude-sonnet-4-20250514',
    system: `
    You are a helpful assistant.
    `,
})

export const AgentDO = agent.DurableObject;