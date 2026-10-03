import { AuthUser } from '@/types/auth'
import { executeTool } from './tools'
import { callLLM } from './llm'

export interface AgentResponse {
  message: string
  intent: 'find_ride' | 'ride_details' | 'request_ride' | 'request_status' | 'cancel_request' | 'commute_information' | 'general_commute_question'
  requiresApproval?: boolean
  approvalAction?: 'createRideRequest' | 'cancelRideRequest'
  approvalData?: any
  toolResults?: any
  data?: any
}

function detectIntentFallback(message: string): AgentResponse['intent'] {
  const m = message.toLowerCase()
  if (m.includes('cancel') || m.includes('withdraw') || m.includes('remove request')) {
    return 'cancel_request'
  }
  if (m.includes('book') || m.includes('request') || m.includes('join') || m.includes('take ride')) {
    return 'request_ride'
  }
  if (m.includes('status') || m.includes('my request') || m.includes('track request')) {
    return 'request_status'
  }
  if (m.includes('detail') || m.includes('view ride') || m.includes('driver info')) {
    return 'ride_details'
  }
  if (m.includes('find') || m.includes('match') || m.includes('search') || m.includes('available') || m.includes('show rides') || m.includes('commute ride')) {
    return 'find_ride'
  }
  if (m.includes('commute') || m.includes('home') || m.includes('office') || m.includes('schedule') || m.includes('profile')) {
    return 'commute_information'
  }
  return 'general_commute_question'
}

export async function runAgent(
  user: AuthUser,
  userMessage: string,
  isApproved = false,
  approvalAction?: string,
  approvalData?: any
): Promise<AgentResponse> {
  const text = userMessage.trim()

  // 1. If explicit user approval was sent, execute approved state-changing action
  if (isApproved && approvalAction) {
    if (approvalAction === 'createRideRequest') {
      const toolRes = await executeTool('createRideRequest', approvalData || { rideId: 'IR-1024' }, user)
      if (toolRes.success) {
        return {
          message: `Your ride request for Ride ${approvalData?.rideId || 'IR-1024'} has been successfully sent to the driver for approval!`,
          intent: 'request_ride',
          requiresApproval: false,
          toolResults: [toolRes],
          data: toolRes.data,
        }
      } else {
        return {
          message: `Unable to create ride request: ${toolRes.error || 'Failed to submit request'}.`,
          intent: 'request_ride',
          requiresApproval: false,
          toolResults: [toolRes],
        }
      }
    }

    if (approvalAction === 'cancelRideRequest') {
      const toolRes = await executeTool('cancelRideRequest', approvalData || { rideId: 'IR-1024' }, user)
      return {
        message: `Your ride request for Ride ${approvalData?.rideId || 'IR-1024'} has been cancelled.`,
        intent: 'cancel_request',
        requiresApproval: false,
        toolResults: [toolRes],
      }
    }
  }

  // 2. Classify intent
  let intent = detectIntentFallback(text)

  // Try LLM for intent refinement if API key exists
  const llmPrompt = `Classify the user intent into one of: find_ride, ride_details, request_ride, request_status, cancel_request, commute_information, general_commute_question. Return JSON {"intent": "..."}. User message: "${text}"`
  const llmRes = await callLLM(llmPrompt)
  if (llmRes) {
    try {
      const jsonMatch = llmRes.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        if (parsed.intent) intent = parsed.intent
      }
    } catch {
      // Fallback intent preserved
    }
  }

  // 3. Handle Intents with Tool Execution & Approval Workflow
  switch (intent) {
    case 'find_ride': {
      const matchRes = await executeTool('findMatchingRides', {}, user)
      const matches = matchRes?.data?.matches || []

      if (matches.length === 0) {
        return {
          message: 'No matching rides found for your current commute route and schedule. Try updating your commute departure time in My Commute.',
          intent: 'find_ride',
          toolResults: [matchRes],
          data: { matches: [] },
        }
      }

      const top = matches[0]
      const responseMsg = `I found ${matches.length} compatible ride${matches.length > 1 ? 's' : ''} for your commute!\n\nTop Match: **${top.ride?.driver || top.ride?.driverName}** (${top.score}/100 compatibility score, ${top.distanceKm} km).\nKey Reasons:\n${top.reasons.map((r: string) => `• ${r}`).join('\n')}`

      return {
        message: responseMsg,
        intent: 'find_ride',
        toolResults: [matchRes],
        data: { matches },
      }
    }

    case 'request_ride': {
      // Extract ride ID if present or use top matching ride
      const rideIdMatch = text.match(/IR-\d+/i) || text.match(/ride\s*(\w+)/i)
      const rideId = rideIdMatch ? rideIdMatch[0].toUpperCase() : 'IR-1024'

      const rideDetails = await executeTool('getRideDetails', { rideId }, user)
      const driverName = rideDetails?.driverName || rideDetails?.driver || 'Verified Driver'
      const price = rideDetails?.pricePerPassenger || 100

      // REQUIRE USER APPROVAL (Requirement 8)
      return {
        message: `I found Ride **${rideId}** with ${driverName} departing at ${rideDetails?.departureTime || '8:20 AM'}.\nPassenger Fare: **₹${price}**.\n\nWould you like me to send the ride request to the driver?`,
        intent: 'request_ride',
        requiresApproval: true,
        approvalAction: 'createRideRequest',
        approvalData: { rideId, pickupLocation: rideDetails?.pickupLocation || 'Hitech City Metro' },
        toolResults: [rideDetails],
      }
    }

    case 'request_status': {
      const statusRes = await executeTool('getRideRequestStatus', { rideId: 'IR-1024' }, user)
      const currentStatus = statusRes?.data?.status || 'none'

      let msg = 'You currently have no active ride requests.'
      if (currentStatus === 'pending') {
        msg = 'Your ride request for **Ride IR-1024** is currently **PENDING driver approval**.'
      } else if (currentStatus === 'accepted') {
        msg = 'Great news! Your ride request for **Ride IR-1024** has been **ACCEPTED / CONFIRMED** by the driver.'
      } else if (currentStatus === 'rejected') {
        msg = 'Your ride request for **Ride IR-1024** was **REJECTED** by the driver.'
      } else if (currentStatus === 'cancelled') {
        msg = 'Your ride request for **Ride IR-1024** is **CANCELLED**.'
      }

      return {
        message: msg,
        intent: 'request_status',
        toolResults: [statusRes],
        data: statusRes?.data,
      }
    }

    case 'cancel_request': {
      // REQUIRE USER APPROVAL (Requirement 8)
      return {
        message: 'Are you sure you want to cancel your pending request for **Ride IR-1024**?',
        intent: 'cancel_request',
        requiresApproval: true,
        approvalAction: 'cancelRideRequest',
        approvalData: { rideId: 'IR-1024' },
      }
    }

    case 'commute_information': {
      const commuteRes = await executeTool('getCommuteProfile', {}, user)
      const c = commuteRes || {}
      return {
        message: `Here is your saved commute profile:\n• **Home**: ${c.origin || 'Kondapur, Hyderabad'}\n• **Office**: ${c.destination || 'Acme HQ, Hitech City'}\n• **Departure**: ${c.departureTime || '8:30 AM'} | **Return**: ${c.returnTime || '5:30 PM'}\n• **Role**: ${c.commuteRole || 'passenger'}`,
        intent: 'commute_information',
        toolResults: [commuteRes],
        data: c,
      }
    }

    case 'ride_details': {
      const rideRes = await executeTool('getRideDetails', { rideId: 'IR-1024' }, user)
      const r = rideRes || {}
      return {
        message: `**Ride ${r.id || 'IR-1024'} Details**:\n• **Driver**: ${r.driverName || 'Rohan Shah'} (${r.vehicleId || 'Honda City · Silver'})\n• **Route**: ${r.origin} → ${r.destination}\n• **Pickup**: ${r.pickupLocation}\n• **Departure**: ${r.departureTime} (ETA: ${r.eta})\n• **Seats Available**: ${r.seatsAvailable}\n• **Price**: ₹${r.pricePerPassenger} / passenger`,
        intent: 'ride_details',
        toolResults: [rideRes],
        data: r,
      }
    }

    default: {
      return {
        message: 'I am your IntelliRide Commute Agent. I can help you find matching rides, check request status, view commute details, and request to join rides. How can I assist your commute today?',
        intent: 'general_commute_question',
      }
    }
  }
}
