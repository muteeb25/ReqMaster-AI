import React, { useState } from 'react';
import { initializeChat, generateStructuredRequirements } from './services/geminiService';
import { sendFeedbackEmail } from './services/emailService';
import { ChatArea } from './components/ChatArea';
import { SummaryView } from './components/SummaryView';
import { Button } from './components/Button';

const App = () => {
  const [view, setView] = useState('login');
  const [user, setUser] = useState(null);
  
  // Auth Form States
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authError, setAuthError] = useState(null);
  
  // App Logic States
  const [messages, setMessages] = useState([]);
  const [chatSession, setChatSession] = useState(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requirements, setRequirements] = useState(null);
  const [currentProject, setCurrentProject] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');

  // Auth Helpers
  const getUsers = () => {
    const stored = localStorage.getItem('reqmaster_users');
    return stored ? JSON.parse(stored) : [];
  };

  const saveUser = (updatedUser) => {
    const users = getUsers();
    const index = users.findIndex(u => u.username === updatedUser.username);
    if (index !== -1) {
      users[index] = updatedUser;
    } else {
      users.push(updatedUser);
    }
    localStorage.setItem('reqmaster_users', JSON.stringify(users));
    setUser(updatedUser);
  };

  const handleLogin = () => {
    setAuthError(null);
    if (!authUsername || !authPassword) {
        setAuthError("Please enter username and password");
        return;
    }
    const users = getUsers();
    const userByUsername = users.find(u => u.username === authUsername);
    
    if (!userByUsername) {
        setAuthError("No account found with this username.");
        return;
    }

    if (userByUsername.password !== authPassword) {
        setAuthError("Incorrect password.");
        return;
    }

    setUser(userByUsername);
    setView('dashboard');
  };

  const handleSignup = () => {
    setAuthError(null);
    if (!authUsername || !authPassword) {
        setAuthError("Please fill all fields");
        return;
    }
    const users = getUsers();
    if (users.find(u => u.username === authUsername)) {
        setAuthError("Account with this username already exists.");
        return;
    }
    const newUser = {
        username: authUsername,
        password: authPassword,
        email: authEmail,
        projects: []
    };
    saveUser(newUser);
    setView('dashboard');
  };

  const handleGuestLogin = () => {
    setAuthError(null);
    const guestUser = {
        username: 'Guest',
        projects: []
    };
    setUser(guestUser);
    setView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setAuthUsername('');
    setAuthPassword('');
    setAuthError(null);
    setMessages([]);
    setView('login');
  };

  const switchAuthView = (newView) => {
      setAuthError(null);
      setAuthUsername('');
      setAuthPassword('');
      setAuthEmail('');
      setView(newView);
  };

  // Start New Project
  const startNewProject = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const chat = await initializeChat(user.username);
      setChatSession(chat);
      setMessages([]);
      setRequirements(null);
      setCurrentProject(null);
      setView('chat');
    } catch (error) {
      console.error("Failed to start chat", error);
      alert("Could not initialize AI. Please check your API Key.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle File Upload
  const handleFileUpload = async (file) => {
    if (!chatSession) return;

    const fileMsg = {
      id: Date.now().toString(),
      role: 'user',
      text: `[Uploaded file: ${file.name}]\n\n${file.type.startsWith('image/') ? 'Please analyze this image and extract any relevant requirements or information.' : file.data}`,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, fileMsg]);
    setIsLoading(true);

    try {
      const response = await chatSession.sendMessage({ message: fileMsg.text });
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text || "I've reviewed your file.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Error processing file", error);
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Sorry, I couldn't process that file. Please try describing the content instead.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Send Message
  const handleSend = async () => {
    if (!input.trim() || !chatSession) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatSession.sendMessage({ message: userMsg.text });
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text || "I didn't catch that.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Error sending message", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate Requirements & Save Project
  const handleFinish = async () => {
    if (messages.length < 2) {
        alert("Please have a longer conversation before analyzing.");
        return;
    }
    setIsLoading(true);
    try {
      const reqs = await generateStructuredRequirements(messages);
      setRequirements(reqs);
      
      // Save Project Logic
      if (user && user.username !== 'Guest') {
          const newProject = {
              id: Date.now().toString(),
              name: reqs.projectName || `Project ${user.projects.length + 1}`,
              createdAt: new Date().toISOString(),
              requirements: reqs,
              messages: [...messages]
          };
          
          const updatedUser = { ...user, projects: [newProject, ...user.projects] };
          saveUser(updatedUser);
          setCurrentProject(newProject);
      }
      
      setView('summary');
    } catch (error) {
      console.error("Extraction failed", error);
      alert("Failed to extract requirements. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const openProject = (project) => {
      setCurrentProject(project);
      setRequirements(project.requirements);
      setMessages(project.messages);
      setChatSession(null);
      setView('summary');
  };

  const deleteProject = (projectId, e) => {
      e.stopPropagation();
      if (!confirm('Are you sure you want to delete this project?')) return;
      
      const updatedUser = {
          ...user,
          projects: user.projects.filter(p => p.id !== projectId)
      };
      saveUser(updatedUser);
  };

  const renderLogin = () => (
    <div className="min-h-screen flex items-center justify-center bg-[#2D283E] p-4">
      <div className="w-full max-w-md bg-[#4C495D] rounded-2xl shadow-2xl border border-[#564F6F] overflow-hidden">
        <div className="bg-[#802BB1] p-8 text-center">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <i className="fas fa-brain text-4xl text-white"></i>
          </div>
          <h1 className="text-2xl font-bold text-white">ReqMaster AI</h1>
          <p className="text-[#D1D7E0] opacity-80 text-sm mt-2">Intelligent Requirements Gathering</p>
        </div>
        
        <div className="p-8 space-y-6">
          {authError && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm flex items-center gap-2">
                <i className="fas fa-exclamation-circle"></i>
                {authError}
            </div>
          )}
          <div>
            <label className="block text-[#D1D7E0] text-sm font-medium mb-2">Username</label>
            <input 
              type="text" 
              className="w-full bg-[#2D283E] border border-[#564F6F] rounded-lg p-3 text-white focus:ring-2 focus:ring-[#802BB1] outline-none transition-all"
              value={authUsername}
              onChange={e => setAuthUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[#D1D7E0] text-sm font-medium mb-2">Password</label>
            <input 
              type="password" 
              className="w-full bg-[#2D283E] border border-[#564F6F] rounded-lg p-3 text-white focus:ring-2 focus:ring-[#802BB1] outline-none transition-all"
              value={authPassword}
              onChange={e => setAuthPassword(e.target.value)}
            />
          </div>
          
          <Button className="w-full" onClick={handleLogin}>
            Login
          </Button>

          <p className="text-center text-sm text-[#D1D7E0]">
             Don't have an account? <button onClick={() => switchAuthView('signup')} className="text-[#802BB1] hover:underline">Sign Up</button>
          </p>
          
          <div className="relative text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#564F6F]"></div></div>
            <span className="relative bg-[#4C495D] px-4 text-xs text-gray-400">OR</span>
          </div>

          <button 
            onClick={handleGuestLogin}
            className="w-full text-[#D1D7E0] hover:text-white text-sm font-medium transition-colors"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );

  const renderSignup = () => (
    <div className="min-h-screen flex items-center justify-center bg-[#2D283E] p-4">
      <div className="w-full max-w-md bg-[#4C495D] rounded-2xl shadow-2xl border border-[#564F6F] overflow-hidden">
        <div className="bg-[#802BB1] p-8 text-center">
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
        </div>
        <div className="p-8 space-y-6">
            {authError && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm flex items-center gap-2">
                    <i className="fas fa-exclamation-circle"></i>
                    {authError}
                </div>
            )}
            <div>
                <label className="block text-[#D1D7E0] text-sm font-medium mb-2">Username</label>
                <input 
                  type="text" 
                  className="w-full bg-[#2D283E] border border-[#564F6F] rounded-lg p-3 text-white focus:ring-2 focus:ring-[#802BB1] outline-none"
                  value={authUsername}
                  onChange={e => setAuthUsername(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-[#D1D7E0] text-sm font-medium mb-2">Email (Optional)</label>
                <input 
                  type="email" 
                  className="w-full bg-[#2D283E] border border-[#564F6F] rounded-lg p-3 text-white focus:ring-2 focus:ring-[#802BB1] outline-none"
                  value={authEmail}
                  onChange={e => setAuthEmail(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-[#D1D7E0] text-sm font-medium mb-2">Password</label>
                <input 
                  type="password" 
                  className="w-full bg-[#2D283E] border border-[#564F6F] rounded-lg p-3 text-white focus:ring-2 focus:ring-[#802BB1] outline-none"
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                />
            </div>
            <Button className="w-full" onClick={handleSignup}>Create Account</Button>
            <p className="text-center text-sm text-[#D1D7E0]">
                Already have an account? <button onClick={() => switchAuthView('login')} className="text-[#802BB1] hover:underline">Login</button>
            </p>
        </div>
      </div>
    </div>
  );

  const handleFeedbackSubmit = async () => {
      if (!feedbackText.trim()) {
          alert('Please write some feedback before submitting.');
          return;
      }

      try {
          setIsLoading(true);
          await sendFeedbackEmail({
              message: feedbackText,
              username: user?.username,
              userEmail: user?.email,
          });
          alert('Thank you for your feedback! It has been sent.');
          setFeedbackText('');
      } catch (error) {
          console.error('Failed to send feedback email', error);
          alert('Could not send feedback right now. Please try again later.');
      } finally {
          setIsLoading(false);
      }
  };

  const renderFeedback = () => (
      <div className="flex-1 p-8 overflow-y-auto h-full">
          <header className="mb-8">
              <h2 className="text-2xl font-bold text-white">Feedback</h2>
              <p className="text-gray-400">We'd love to hear your thoughts.</p>
          </header>
          
          <div className="bg-[#4C495D] p-6 rounded-2xl border border-[#564F6F] max-w-2xl">
              <textarea 
                className="w-full bg-[#2D283E] border border-[#564F6F] rounded-lg p-4 text-white h-40 resize-none focus:ring-2 focus:ring-[#802BB1] outline-none mb-4"
                placeholder="Tell us what you think..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
              ></textarea>
              <Button onClick={handleFeedbackSubmit} disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Submit Feedback'}
              </Button>
          </div>

          <div className="mt-12 border-t border-[#564F6F] pt-8">
              <h3 className="text-xl font-bold text-white mb-6">Contact Us</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                  <div className="flex items-center gap-4 text-[#D1D7E0]">
                      <div className="w-10 h-10 rounded-full bg-[#564F6F] flex items-center justify-center">
                          <i className="fas fa-envelope text-[#802BB1]"></i>
                      </div>
                      <div>
                          <p className="text-sm text-gray-400">Email Support</p>
                          <p className="font-medium">muteebm93@gmail.com</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-4 text-[#D1D7E0]">
                      <div className="w-10 h-10 rounded-full bg-[#564F6F] flex items-center justify-center">
                          <i className="fas fa-phone text-[#802BB1]"></i>
                      </div>
                      <div>
                          <p className="text-sm text-gray-400">Phone</p>
                          <p className="font-medium">+92 311 1234958</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-4 text-[#D1D7E0]">
                      <div className="w-10 h-10 rounded-full bg-[#564F6F] flex items-center justify-center">
                          <i className="fas fa-map-marker-alt text-[#802BB1]"></i>
                      </div>
                      <div>
                          <p className="text-sm text-gray-400">Office</p>
                          <p className="font-medium">123 ABC CITY</p>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  );

  const renderSidebar = () => (
    <div className="w-64 bg-[#564F6F] hidden md:flex flex-col border-r border-[#4C495D] h-screen sticky top-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#802BB1] rounded-lg flex items-center justify-center">
            <i className="fas fa-layer-group text-white text-sm"></i>
          </div>
          <span className="font-bold text-white tracking-wide">ReqMaster</span>
        </div>
        
        <div className="flex-1 px-4 space-y-2">
          <div 
            onClick={() => setView('dashboard')}
            className={`px-4 py-2 rounded-lg text-white cursor-pointer flex items-center transition-colors ${view === 'dashboard' ? 'bg-[#4C495D]/50 border-l-4 border-[#802BB1]' : 'hover:bg-[#4C495D]/30 text-gray-300'}`}
          >
            <i className="fas fa-home mr-3 w-5"></i> Dashboard
          </div>
          <div 
            onClick={() => setView('feedback')}
            className={`px-4 py-2 rounded-lg text-white cursor-pointer flex items-center transition-colors ${view === 'feedback' ? 'bg-[#4C495D]/50 border-l-4 border-[#802BB1]' : 'hover:bg-[#4C495D]/30 text-gray-300'}`}
          >
            <i className="fas fa-comment-alt mr-3 w-5"></i> Feedback
          </div>
        </div>

        <div className="p-4 border-t border-[#4C495D]">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#802BB1] flex items-center justify-center text-xs text-white font-bold">
                    {user?.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm text-white font-medium truncate">{user?.username}</p>
                </div>
            </div>
            <button onClick={handleLogout} className="w-full text-left text-xs text-red-300 hover:text-red-400 flex items-center">
                <i className="fas fa-sign-out-alt mr-2"></i> Logout
            </button>
        </div>
    </div>
  );

  const renderDashboard = () => (
      <div className="flex-1 p-8 overflow-y-auto h-full">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl font-bold text-white">Welcome back, {user?.username}!</h2>
            <p className="text-gray-400">Ready to define your next big idea?</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* New Project Card */}
          <div className="bg-gradient-to-br from-[#802BB1] to-[#564F6F] rounded-2xl p-8 text-white shadow-xl relative overflow-hidden group col-span-1 lg:col-span-3 xl:col-span-1 h-64">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-4">
                    <i className="fas fa-plus text-xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">New Session</h3>
                  <p className="opacity-90 text-sm">Start gathering requirements.</p>
              </div>
              <Button onClick={startNewProject} className="bg-white !text-[#802BB1] font-bold hover:bg-gray-100 shadow-none border-none w-fit">
                Start Interview
              </Button>
            </div>
          </div>

          {/* Recent Projects List */}
          <div className="col-span-1 lg:col-span-3 xl:col-span-2">
            <h3 className="text-xl font-bold text-white mb-4">Recent Projects</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user?.projects && user.projects.length > 0 ? (
                    user.projects.map((proj) => (
                        <div 
                            key={proj.id} 
                            onClick={() => openProject(proj)}
                            className="bg-[#4C495D] p-5 rounded-xl border border-[#564F6F] hover:border-[#802BB1] cursor-pointer transition-all hover:-translate-y-1 group relative"
                        >
                            <button
                                onClick={(e) => deleteProject(proj.id, e)}
                                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white p-2 rounded-lg"
                                title="Delete project"
                            >
                                <i className="fas fa-trash text-xs"></i>
                            </button>
                            <div className="flex justify-between items-start mb-2">
                                <div className="w-10 h-10 rounded-lg bg-[#2D283E] flex items-center justify-center group-hover:bg-[#802BB1] transition-colors">
                                    <i className="fas fa-file-alt text-[#D1D7E0] group-hover:text-white"></i>
                                </div>
                                <span className="text-xs text-gray-400">{new Date(proj.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h4 className="font-bold text-white text-lg mb-1">{proj.name}</h4>
                            <p className="text-xs text-gray-400">
                                {proj.requirements.functional.length + proj.requirements.nonFunctional.length} Requirements identified
                            </p>
                        </div>
                    ))
                ) : (
                    <div className="col-span-2 bg-[#4C495D] rounded-xl p-8 border border-[#564F6F] border-dashed flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-[#2D283E] rounded-full flex items-center justify-center mb-3 text-[#564F6F]">
                          <i className="fas fa-folder-open"></i>
                        </div>
                        <p className="text-gray-400">No projects yet. Start your first session!</p>
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>
  );

  const renderAppContent = () => {
      return (
        <div className="min-h-screen bg-[#2D283E] flex">
            {renderSidebar()}
            <div className="flex-1 h-screen overflow-hidden flex flex-col">
                {view === 'dashboard' && renderDashboard()}
                {view === 'feedback' && renderFeedback()}
                {view === 'chat' && (
                    <ChatArea 
                        messages={messages}
                        input={input}
                        setInput={setInput}
                        onSend={handleSend}
                        isLoading={isLoading}
                        onFinish={handleFinish}
                        onFileUpload={handleFileUpload}
                        readOnly={!!currentProject && !chatSession}
                    />
                )}
                {view === 'summary' && requirements && (
                    <div className="flex-1 overflow-y-auto">
                        <SummaryView 
                            data={requirements} 
                            onBack={async () => {
                                // When coming from a saved project, there may not be an active
                                // chat session. In that case, initialize a new one so the user
                                // can continue chatting and run Analyze & Finish again.
                                if (!chatSession && user) {
                                    try {
                                        setIsLoading(true);
                                        const chat = await initializeChat(user.username);
                                        setChatSession(chat);
                                    } catch (error) {
                                        console.error("Failed to resume chat session", error);
                                        alert("Could not resume AI chat. Please check your API key.");
                                    } finally {
                                        setIsLoading(false);
                                    }
                                }
                                setView('chat');
                            }}
                            isReviewMode={!chatSession}
                        />
                    </div>
                )}
            </div>
        </div>
      );
  };

  return (
    <>
      {view === 'login' && renderLogin()}
      {view === 'signup' && renderSignup()}
      {['dashboard', 'chat', 'summary', 'feedback'].includes(view) && renderAppContent()}
    </>
  );
};

export default App;
