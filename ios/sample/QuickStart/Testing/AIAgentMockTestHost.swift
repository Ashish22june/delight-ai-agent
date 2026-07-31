//
//  AIAgentMockTestHost.swift
//  QuickStart
//

import UIKit
import SendbirdChatSDK
@_spi(SendbirdInternal) import SendbirdAIAgentMessenger

final class AIAgentMockTestHost {
    private let configuration: AIAgentMockLaunchConfiguration
    private var didStart = false

    init(configuration: AIAgentMockLaunchConfiguration) {
        self.configuration = configuration
    }

    func install(on window: UIWindow) {
        applySampleConfiguration()

        let rootViewController = AIAgentMockRootViewController(
            configuration: configuration,
            onReadyToStart: { [weak self] parent in
                self?.start(on: parent)
            }
        )
        window.rootViewController = rootViewController
        window.makeKeyAndVisible()
    }

    private func applySampleConfiguration() {
        SampleConfiguration.appId = configuration.appId
        SampleConfiguration.aiAgentId = configuration.aiAgentId
        SampleConfiguration.userId = configuration.userId
        SampleConfiguration.sessionToken = configuration.sessionToken
        SampleConfiguration.sessionInfoType = .manual
        SampleConfiguration.productionServer = nil
    }

    private func start(on parent: UIViewController) {
        guard !didStart else { return }
        didStart = true

        // Record mode needs verbose SDK logs to feed the fixture recorder
        // (captured via OSLogReceiver into the unified log under
        // `com.sendbird.logbird`). Playback / normal sample runs keep
        // whatever SampleConfiguration sets.
        // Using the new `SendbirdLogger.setLevel` API rather than the
        // deprecated `params.logLevel` keeps types consistent with
        // SampleConfiguration after the auth-ios logger refactor.
        SendbirdLogger.setLevel(
            self.configuration.runMode == .record
                ? .verbose
                : SampleConfiguration.logLevel
        )

        AIAgentMessenger.initialize(
            appId: configuration.appId,
            paramsBuilder: { params in
                // In playback mode, route the SDK at the local mock server.
                // In record mode, leave host overrides unset so the SDK uses
                // its default preprod routing for `configuration.appId`.
                if self.configuration.runMode == .playback {
                    params.apiHost = self.configuration.restBaseURL.absoluteString
                    params.wsHost = self.configuration.webSocketURL.absoluteString
                    params.deskAPIHost = self.configuration.restBaseURL
                        .appendingPathComponent("sapi")
                        .absoluteString
                }
            },
            completionHandler: { [weak self, weak parent] result in
                guard let self, let parent else { return }

                switch result {
                case .success:
                    if self.configuration.runMode == .record {
                        Task {
                            await self.startInRecordMode(on: parent)
                        }
                    } else {
                        // Wipe the SDK's on-disk channel/message cache before
                        // connecting in playback mode. Without this, previously
                        // launched scenarios under the same channel_url
                        // placeholder (e.g. `channel_001`) bleed into the
                        // current playback — the SDK reads cached messages
                        // from the prior scenario instead of fetching the
                        // mock server's response. Manifests as snapshot tests
                        // showing the *previous* scenario's view content.
                        SendbirdChat.clearCachedData { [weak self, weak parent] _ in
                            guard let self, let parent else { return }
                            Task { @MainActor in
                                self.presentTargetView(on: parent, channelURL: self.configuration.channelURL)
                            }
                        }
                    }
                case .failure(let error):
                    assertionFailure("[AIAgentMockTestHost] SDK initialization failed: \(error.localizedDescription)")
                }
            }
        )
    }

    /// PR 8: host record-mode no longer creates channels or sends messages —
    /// those preconditions are owned by the test process's `setupGiven`
    /// helper, which runs SDK calls directly against preprod before launching
    /// the host. Host's only record-mode duty is to connect to preprod with
    /// the caller-supplied userId, write the identifier snapshot that
    /// `record:sanitize` consumes, and present the same view it would in
    /// playback. The channel URL the view needs (for conversation-mode
    /// scenarios) arrives via `SBA_AIAGENT_CHANNEL_URL` from the test process.
    private func startInRecordMode(on parent: UIViewController) async {
        do {
            try await self.connectUserForRecordMode()

            try AIAgentMockRecordMeta.write(
                scenario: self.configuration.scenario,
                appId: self.configuration.appId,
                aiAgentId: self.configuration.aiAgentId,
                userId: self.configuration.userId,
                channelURL: self.configuration.channelURL
            )

            await MainActor.run {
                self.presentTargetView(on: parent, channelURL: self.configuration.channelURL)
            }
        } catch {
            let nsError = error as NSError
            print("[AIAgentMockTestHost] startInRecordMode failed: \(type(of: error)) — \(error.localizedDescription)")
            print("[AIAgentMockTestHost]   domain=\(nsError.domain) code=\(nsError.code) userInfo=\(nsError.userInfo)")
            assertionFailure("[AIAgentMockTestHost] Failed to connect for record mode: \(error.localizedDescription)")
        }
    }

    private func connectUserForRecordMode() async throws {
        try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, Error>) in
            SendbirdChat.connect(userId: self.configuration.userId) { _, error in
                if let error {
                    continuation.resume(throwing: error)
                } else {
                    continuation.resume()
                }
            }
        }
    }

    @MainActor
    private func presentTargetView(on parent: UIViewController, channelURL: String) {
        switch self.configuration.presentation {
        case .conversation:
            self.presentConversation(on: parent, channelURL: channelURL)
        case .conversationList:
            self.presentConversationList(on: parent)
        default:
            assertionFailure(
                "[AIAgentMockTestHost] Unknown PresentationKind '\(self.configuration.presentation.rawValue)'. "
                + "Add a case to presentTargetView or check the .xctestplan's SBA_SUITE_PRESENTATION value."
            )
        }
    }

    private func presentConversation(on parent: UIViewController, channelURL: String) {
        AIAgentStarterKit.updateContextObjects(
            language: "en",
            countryCode: "US",
            context: [:]
        )
        AIAgentStarterKit.applyCustomizations()

        AIAgentMessenger.updateSessionInfo(
            with: .manual(
                userId: configuration.userId,
                sessionToken: configuration.sessionToken,
                aiAgentSessionDelegate: nil
            )
        )

        AIAgentMessenger.presentConversation(
            aiAgentId: configuration.aiAgentId,
            channelURL: channelURL
        ) { params in
            params.language = AIAgentStarterKit.contextObjects.language
            params.countryCode = AIAgentStarterKit.contextObjects.countryCode
            params.context = AIAgentStarterKit.contextObjects.context
            params.parent = parent
        }
    }

    private func presentConversationList(on parent: UIViewController) {
        AIAgentStarterKit.updateContextObjects(
            language: "en",
            countryCode: "US",
            context: [:]
        )
        AIAgentStarterKit.applyCustomizations()

        AIAgentMessenger.updateSessionInfo(
            with: .manual(
                userId: configuration.userId,
                sessionToken: configuration.sessionToken,
                aiAgentSessionDelegate: nil
            )
        )

        AIAgentMessenger.presentConversationList(
            aiAgentId: configuration.aiAgentId
        ) { params in
            params.language = AIAgentStarterKit.contextObjects.language
            params.countryCode = AIAgentStarterKit.contextObjects.countryCode
            params.context = AIAgentStarterKit.contextObjects.context
            params.parent = parent
        }
    }
}

private final class AIAgentMockRootViewController: UIViewController {
    private let configuration: AIAgentMockLaunchConfiguration
    private let onReadyToStart: (UIViewController) -> Void

    init(
        configuration: AIAgentMockLaunchConfiguration,
        onReadyToStart: @escaping (UIViewController) -> Void
    ) {
        self.configuration = configuration
        self.onReadyToStart = onReadyToStart
        super.init(nibName: nil, bundle: nil)
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemBackground
        view.accessibilityIdentifier = "aiagent.mockTestHost.\(configuration.scenario)"
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        onReadyToStart(self)
    }
}
